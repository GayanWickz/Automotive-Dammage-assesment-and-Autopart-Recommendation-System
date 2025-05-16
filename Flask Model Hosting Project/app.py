from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras import Model
from sklearn.neighbors import NearestNeighbors
from ultralytics import YOLO
from rembg import remove
from collections import Counter
from utils import preprocess_image

app = Flask(__name__)
CORS(app)

# Load YOLOv8x model
yolo_model = YOLO('yolov8x.pt')

# Load the saved model and feature extractor
model = tf.keras.models.load_model("resnet_vehicle_model18.keras")  # Placeholder; update path if needed
feature_extractor = Model(inputs=model.input, outputs=model.layers[-3].output)

# Load saved features and labels (adjust paths as needed for local setup)
train_features = np.load("resnet_train_features18.npy")
train_labels = np.load("resnet_train_labels18.npy")

# Initialize Nearest Neighbors
nn = NearestNeighbors(n_neighbors=3, metric='cosine')
nn.fit(train_features)

@app.route('/')
def home():
    return "Flask Server is Running! Use POST /ai-search endpoint with image files"

@app.route('/ai-search', methods=['POST'])
def ai_search():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    try:
        image_file = request.files['image']

        # Convert uploaded file to OpenCV image
        file_bytes = np.asarray(bytearray(image_file.read()), dtype=np.uint8)
        img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        # Remove background
        img_no_bg = remove(img)
        img_no_bg = cv2.cvtColor(np.array(img_no_bg), cv2.COLOR_RGBA2RGB)

        # Save temporarily for YOLO processing
        temp_filename = "temp_image.jpg"
        cv2.imwrite(temp_filename, cv2.cvtColor(img_no_bg, cv2.COLOR_RGB2BGR))

        # Run prediction with the updated logic
        prediction, neighbors, confidence, _ = predict_image_with_neighbors_and_confidence(temp_filename)

        # Print prediction details to console (similar to Colab)
        print(f"\nPrediction for {image_file.filename}: {prediction}")
        print(f"Nearest neighbor labels: {neighbors}")
        print(f"Confidence: {confidence:.4f}")

        # Check if confidence is less than 85%
        if confidence < 0.85:
            return jsonify({'error': 'cannot identify please try again'}), 400

        return jsonify({
            'class': prediction,
            'nearest_neighbors': neighbors,
            'confidence': float(confidence)
        })

    except Exception as e:
        print(f"Error processing {image_file.filename}: {str(e)}")
        return jsonify({'error': str(e)}), 500

def predict_image_with_neighbors_and_confidence(image_path):
    img = cv2.imread(image_path)
    if img is None:
        return "Error: Could not read image.", [], 0.0, None

    # Convert to RGB
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # Remove background (already done, but keeping for consistency)
    img_no_bg = remove(img_rgb)
    img_no_bg = cv2.cvtColor(np.array(img_no_bg), cv2.COLOR_RGBA2RGB)

    # YOLOv8 detection
    results = yolo_model(img_no_bg)

    detected_features = []
    edge_images = []

    # Process YOLOv8 results
    for result in results:
        boxes = result.boxes.xyxy.cpu().numpy()
        classes = result.boxes.cls.cpu().numpy()
        confs = result.boxes.conf.cpu().numpy()

        for box, cls, conf in zip(boxes, classes, confs):
            # Filter for cars (class 2 in COCO dataset) with confidence > 50%
            if int(cls) == 2 and conf > 0.5:
                x1, y1, x2, y2 = map(int, box)

                try:
                    # Crop detected vehicle
                    cropped = img_no_bg[y1:y2, x1:x2]

                    # Resize to match training pipeline
                    resized = cv2.resize(cropped, (224, 224))

                    # Apply full preprocessing
                    processed = preprocess_image(resized)

                    # Extract features
                    feature = feature_extractor.predict(np.array([processed]), verbose=0)
                    detected_features.append(feature.flatten())

                    # Store edge visualization (optional, not returned in API)
                    gray_resized = cv2.cvtColor(resized, cv2.COLOR_RGB2GRAY)
                    equalized_resized = cv2.equalizeHist(gray_resized)
                    edge_img = cv2.Canny(equalized_resized, 5000, 1000, apertureSize=5, L2gradient=True)
                    kernel = np.ones((1, 1), np.uint8)
                    closed_edges = cv2.morphologyEx(edge_img, cv2.MORPH_CLOSE, kernel)
                    edge_images.append(closed_edges)

                except Exception as e:
                    print(f"Error processing detection in {image_path}: {str(e)}")
                    continue

    if not detected_features:
        return "No valid features extracted or no cars detected.", [], 0.0, None

    detected_features = np.array(detected_features)
    distances, indices = nn.kneighbors(detected_features)

    # Aggregate predictions from all detected cars
    all_neighbor_indices = indices.flatten()
    predicted_labels = train_labels[all_neighbor_indices]

    # Majority voting with confidence
    label_counts = Counter(predicted_labels)
    if not label_counts:
        return "No predictions made.", [], 0.0, None

    most_common = label_counts.most_common(1)
    final_prediction = most_common[0][0]
    confidence = most_common[0][1] / len(predicted_labels)

    # Get unique nearest neighbor labels
    nearest_neighbor_labels = list(set(predicted_labels))

    return final_prediction, nearest_neighbor_labels, confidence, edge_images

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, ssl_context=("cert.pem", "key.pem"))