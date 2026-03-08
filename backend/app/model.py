import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import (
    Conv2D, MaxPooling2D, Flatten, Dense, 
    Dropout, BatchNormalization, Input
)
import numpy as np
import os
import logging

logger = logging.getLogger(__name__)

class SignLanguageModel:
    def __init__(self):
        self.model = None
        self.model_path = os.environ.get("MODEL_PATH", "models/isl_model.h5")
        self._load_or_create_model()
    
    def _load_or_create_model(self):
        """Load existing model or create a new one"""
        try:
            if os.path.exists(self.model_path):
                self.model = load_model(self.model_path)
                logger.info(f"Model loaded from {self.model_path}")
            else:
                self.model = self._create_model()
                logger.info("Created new model (no pretrained weights)")
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            self.model = self._create_model()
    
    def _create_model(self):
        """Create CNN model architecture for ISL recognition"""
        model = Sequential([
            Input(shape=(64, 64, 3)),
            
            # First Convolutional Block
            Conv2D(32, (3, 3), activation='relu', padding='same'),
            BatchNormalization(),
            Conv2D(32, (3, 3), activation='relu', padding='same'),
            MaxPooling2D((2, 2)),
            Dropout(0.25),
            
            # Second Convolutional Block
            Conv2D(64, (3, 3), activation='relu', padding='same'),
            BatchNormalization(),
            Conv2D(64, (3, 3), activation='relu', padding='same'),
            MaxPooling2D((2, 2)),
            Dropout(0.25),
            
            # Third Convolutional Block
            Conv2D(128, (3, 3), activation='relu', padding='same'),
            BatchNormalization(),
            Conv2D(128, (3, 3), activation='relu', padding='same'),
            MaxPooling2D((2, 2)),
            Dropout(0.25),
            
            # Fourth Convolutional Block
            Conv2D(256, (3, 3), activation='relu', padding='same'),
            BatchNormalization(),
            MaxPooling2D((2, 2)),
            Dropout(0.25),
            
            # Fully Connected Layers
            Flatten(),
            Dense(512, activation='relu'),
            BatchNormalization(),
            Dropout(0.5),
            Dense(256, activation='relu'),
            Dropout(0.3),
            Dense(36, activation='softmax')  # 26 letters + 10 digits
        ])
        
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def predict(self, image: np.ndarray) -> np.ndarray:
        """Make prediction on preprocessed image"""
        if self.model is None:
            raise ValueError("Model not loaded")
        return self.model.predict(image, verbose=0)
    
    def is_loaded(self) -> bool:
        """Check if model is loaded"""
        return self.model is not None
    
    def save_model(self, path: str = None):
        """Save model to file"""
        save_path = path or self.model_path
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        self.model.save(save_path)
        logger.info(f"Model saved to {save_path}")
