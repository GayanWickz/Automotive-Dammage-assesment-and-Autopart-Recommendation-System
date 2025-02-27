import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import VGG16
from tensorflow.keras import layers, models
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.layers import Flatten, Dense, Dropout

# Define the ImageDataGenerator with resizing to (224, 224) and augmentation
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=30,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    fill_mode='nearest'
)

validation_datagen = ImageDataGenerator(rescale=1./255) #only rescale the validation data.

# Use the target_size parameter to resize images to (224, 224)
train_generator = train_datagen.flow_from_directory(
    '/content/drive/My Drive/vehicle_parts_dataset/Dataset/train/Aqua',  # General training folder
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical'
)

validation_generator = validation_datagen.flow_from_directory(
    '/content/drive/My Drive/vehicle_parts_dataset/Dataset/validation/Aqua', # General validation folder
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical'
)

num_classes = train_generator.num_classes  # Get the number of classes

# Load VGG16 pre-trained model without the top layer (to add our own)
base_model = VGG16(weights='imagenet', include_top=False, input_shape=(224, 224, 3))

# Freeze the layers in the pre-trained model to avoid re-training them
base_model.trainable = False

model = tf.keras.Sequential([
    base_model,
    Flatten(),
    Dense(256, activation='relu'),
    Dropout(0.5),
    Dense(num_classes, activation='softmax')
])

# Compile the model
model.compile(optimizer=Adam(learning_rate=0.0001),
              loss='categorical_crossentropy',
              metrics=['accuracy'])

# Summary of the model architecture
model.summary()

# Train the model using the training and validation data
history = model.fit(
    train_generator,
    steps_per_epoch=train_generator.samples // train_generator.batch_size,
    epochs=10,
    validation_data=validation_generator,
    validation_steps=validation_generator.samples // validation_generator.batch_size
)