from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
from PIL import Image
import io
import logging

from .model import SignLanguageModel
from .utils import preprocess_image

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Indian Sign Language Recognition API",
    description="API for recognizing Indian Sign Language gestures from images",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize model
model = SignLanguageModel()

# ISL Classes (A-Z + 0-9 for Indian Sign Language)
ISL_CLASSES = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
    'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3',
    '4', '5', '6', '7', '8', '9'
]

@app.get("/")
async def root():
    return {
        "message": "Indian Sign Language Recognition API",
        "status": "active",
        "endpoints": {
            "predict": "/predict",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model.is_loaded()}

@app.post("/predict")
async def predict_sign(file: UploadFile = File(...)):
    """
    Predict the sign language gesture from an uploaded image
    """
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Preprocess image
        processed_image = preprocess_image(image)
        
        # Make prediction
        prediction = model.predict(processed_image)
        
        # Get top 3 predictions
        top_indices = np.argsort(prediction[0])[-3:][::-1]
        results = []
        
        for idx in top_indices:
            results.append({
                "sign": ISL_CLASSES[idx],
                "confidence": float(prediction[0][idx]) * 100
            })
        
        return JSONResponse({
            "success": True,
            "prediction": results[0]["sign"],
            "confidence": results[0]["confidence"],
            "top_predictions": results
        })
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-batch")
async def predict_batch(files: list[UploadFile] = File(...)):
    """
    Predict multiple sign language gestures to form words
    """
    predictions = []
    
    for file in files:
        try:
            contents = await file.read()
            image = Image.open(io.BytesIO(contents)).convert("RGB")
            processed_image = preprocess_image(image)
            prediction = model.predict(processed_image)
            
            predicted_idx = np.argmax(prediction[0])
            predictions.append(ISL_CLASSES[predicted_idx])
            
        except Exception as e:
            logger.error(f"Batch prediction error: {str(e)}")
            predictions.append("?")
    
    return JSONResponse({
        "success": True,
        "word": "".join(predictions),
        "letters": predictions
    })
