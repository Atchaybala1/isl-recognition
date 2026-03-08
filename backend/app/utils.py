import numpy as np
from PIL import Image
import cv2

def preprocess_image(image: Image.Image, target_size: tuple = (64, 64)) -> np.ndarray:
    """
    Preprocess image for model prediction
    
    Args:
        image: PIL Image object
        target_size: Target size for resizing
    
    Returns:
        Preprocessed numpy array ready for prediction
    """
    # Convert to numpy array
    img_array = np.array(image)
    
    # Convert RGB to BGR for OpenCV processing
    img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
    
    # Apply skin detection for better hand isolation
    img_processed = detect_hand_region(img_bgr)
    
    # Resize image
    img_resized = cv2.resize(img_processed, target_size)
    
    # Convert back to RGB
    img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
    
    # Normalize pixel values
    img_normalized = img_rgb.astype('float32') / 255.0
    
    # Add batch dimension
    img_batch = np.expand_dims(img_normalized, axis=0)
    
    return img_batch

def detect_hand_region(image: np.ndarray) -> np.ndarray:
    """
    Detect and enhance hand region using skin color detection
    
    Args:
        image: BGR image as numpy array
    
    Returns:
        Processed image with enhanced hand region
    """
    # Convert to HSV color space
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    
    # Define skin color range in HSV
    lower_skin = np.array([0, 20, 70], dtype=np.uint8)
    upper_skin = np.array([20, 255, 255], dtype=np.uint8)
    
    # Create skin mask
    mask = cv2.inRange(hsv, lower_skin, upper_skin)
    
    # Apply morphological operations to clean up mask
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    
    # Apply Gaussian blur to smooth edges
    mask = cv2.GaussianBlur(mask, (5, 5), 0)
    
    # Apply mask to original image
    result = cv2.bitwise_and(image, image, mask=mask)
    
    # If hand region is too small, return original image
    if np.sum(mask > 0) < 1000:
        return image
    
    return result

def extract_features(image: np.ndarray) -> np.ndarray:
    """
    Extract additional features from image for improved recognition
    """
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply edge detection
    edges = cv2.Canny(gray, 50, 150)
    
    # Calculate HOG-like features
    gx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    
    magnitude = np.sqrt(gx**2 + gy**2)
    
    return magnitude
