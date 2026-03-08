import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import './WebcamCapture.css';

function WebcamCapture({ onCapture, loading }) {
  const webcamRef = useRef(null);
  const [captured, setCaptured] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: 'user',
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCaptured(imageSrc);
      onCapture(imageSrc);
    }
  }, [onCapture]);

  const retake = () => {
    setCaptured(null);
  };

  const handleUserMediaError = (error) => {
    console.error('Camera error:', error);
    setCameraError('Unable to access camera. Please ensure camera permissions are granted.');
  };

  if (cameraError) {
    return (
      <div className="webcam-capture">
        <div className="camera-error">
          <span className="error-icon">📷</span>
          <p>{cameraError}</p>
          <button onClick={() => setCameraError(null)} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="webcam-capture">
      <div className="webcam-container">
        {captured ? (
          <motion.div
            className="captured-preview"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <img src={captured} alt="Captured" className="captured-image" />
            {loading && (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <p>Analyzing sign...</p>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="webcam-view">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              onUserMediaError={handleUserMediaError}
              className="webcam"
            />
            <div className="webcam-guide">
              <div className="guide-frame"></div>
              <p>Position your hand sign within the frame</p>
            </div>
          </div>
        )}
      </div>

      <div className="webcam-controls">
        {captured ? (
          <>
            <button onClick={retake} className="control-btn retake" disabled={loading}>
              🔄 Retake
            </button>
            <button onClick={() => onCapture(captured)} className="control-btn analyze" disabled={loading}>
              🔍 Analyze Again
            </button>
          </>
        ) : (
          <motion.button
            onClick={capture}
            className="capture-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="capture-icon">📸</span>
            Capture Sign
          </motion.button>
        )}
      </div>

      <div className="tips">
        <h4>💡 Tips for better recognition:</h4>
        <ul>
          <li>Ensure good lighting on your hand</li>
          <li>Keep a plain background if possible</li>
          <li>Position your hand clearly in frame</li>
          <li>Hold the sign steady while capturing</li>
        </ul>
      </div>
    </div>
  );
}

export default WebcamCapture;
