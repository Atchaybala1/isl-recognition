import React from 'react';
import { motion } from 'framer-motion';
import './ResultDisplay.css';

function ResultDisplay({ result }) {
  if (!result || !result.success) {
    return null;
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#4CAF50';
    if (confidence >= 60) return '#FFC107';
    return '#FF5722';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 80) return 'High';
    if (confidence >= 60) return 'Medium';
    return 'Low';
  };

  return (
    <motion.div
      className="result-display"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="result-card main-result">
        <span className="result-label">Detected Sign</span>
        <motion.span
          className="result-letter"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
        >
          {result.prediction}
        </motion.span>
        <div className="confidence-meter">
          <div className="confidence-bar">
            <motion.div
              className="confidence-fill"
              initial={{ width: 0 }}
              animate={{ width: `${result.confidence}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{ backgroundColor: getConfidenceColor(result.confidence) }}
            />
          </div>
          <span className="confidence-text">
            {result.confidence.toFixed(1)}% Confidence 
            <span 
              className="confidence-badge"
              style={{ backgroundColor: getConfidenceColor(result.confidence) }}
            >
              {getConfidenceLabel(result.confidence)}
            </span>
          </span>
        </div>
      </div>

      {result.top_predictions && result.top_predictions.length > 1 && (
        <div className="alternative-results">
          <h4>Other Possibilities</h4>
          <div className="alternatives-grid">
            {result.top_predictions.slice(1).map((pred, index) => (
              <motion.div
                key={index}
                className="alternative-card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <span className="alt-letter">{pred.sign}</span>
                <span className="alt-confidence">
                  {pred.confidence.toFixed(1)}%
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default ResultDisplay;
