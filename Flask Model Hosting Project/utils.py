import cv2
import numpy as np
import tensorflow as tf

def preprocess_image(img):
    """
    Processes uploaded image to match model requirements.
    Replicates the preprocessing from Google Colab.
    """
    try:
        # Ensure input is in uint8 format
        if img.dtype != np.uint8:
            img = img.astype(np.uint8)

        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

        # Apply Histogram Equalization
        equalized = cv2.equalizeHist(gray)

        # Edge Detection
        edges = cv2.Canny(equalized, 5000, 1000, apertureSize=5, L2gradient=True)
        kernel = np.ones((1, 1), np.uint8)
        closed_edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)

        # Overlay edges on grayscale image
        overlay = equalized.copy()
        overlay[closed_edges == 255] = 255  # Highlight edges in white

        # Convert single-channel grayscale back to 3-channel image for ResNet
        overlay_3ch = cv2.cvtColor(overlay, cv2.COLOR_GRAY2RGB)

        # Apply ResNet preprocessing
        return tf.keras.applications.resnet50.preprocess_input(overlay_3ch)

    except Exception as e:
        raise RuntimeError(f"Image preprocessing failed: {str(e)}")