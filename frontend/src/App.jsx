import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUpload from './components/ImageUpload';
import WebcamCapture from './components/WebcamCapture';
import ResultDisplay from './components/ResultDisplay';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [mode, setMode] = useState('upload'); // 'upload' or 'webcam'
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wordBuffer, setWordBuffer] = useState([]);

  const handlePrediction = useCallback(async (imageData) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      
      // Handle both File objects and base64 data
      if (imageData instanceof File) {
        formData.append('file', imageData);
      } else {
        // Convert base64 to blob
        const response = await fetch(imageData);
        const blob = await response.blob();
        formData.append('file', blob, 'capture.jpg');
      }

      const res = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Prediction failed');
      }

      const data = await res.json();
      setResult(data);
      
      // Add to word buffer
      if (data.prediction) {
        setWordBuffer(prev => [...prev, data.prediction]);
      }
    } catch (err) {
      setError(err.message || 'Failed to process image');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearWordBuffer = () => {
    setWordBuffer([]);
  };

  const removeLastLetter = () => {
    setWordBuffer(prev => prev.slice(0, -1));
  };

  const addSpace = () => {
    setWordBuffer(prev => [...prev, ' ']);
  };

  return (
    <div className="app">
      {/* Header */}
      <motion.header 
        className="header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🤟</span>
            <h1>ISL Recognition</h1>
          </div>
          <p className="tagline">Indian Sign Language to Text Converter</p>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="main-content">
        {/* Mode Toggle */}
        <motion.div 
          className="mode-toggle"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            className={`toggle-btn ${mode === 'upload' ? 'active' : ''}`}
            onClick={() => setMode('upload')}
          >
            📁 Upload Image
          </button>
          <button
            className={`toggle-btn ${mode === 'webcam' ? 'active' : ''}`}
            onClick={() => setMode('webcam')}
          >
            📷 Use Webcam
          </button>
        </motion.div>

        {/* Input Section */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            className="input-section"
            initial={{ opacity: 0, x: mode === 'upload' ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'upload' ? 50 : -50 }}
            transition={{ duration: 0.3 }}
          >
            {mode === 'upload' ? (
              <ImageUpload onImageSelect={handlePrediction} loading={loading} />
            ) : (
              <WebcamCapture onCapture={handlePrediction} loading={loading} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Display */}
        <AnimatePresence>
          {result && (
            <ResultDisplay result={result} />
          )}
        </AnimatePresence>

        {/* Word Builder */}
        <motion.div
          className="word-builder"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3>📝 Word Builder</h3>
          <div className="word-display">
            {wordBuffer.length > 0 ? (
              <span className="built-word">{wordBuffer.join('')}</span>
            ) : (
              <span className="placeholder">Captured letters will appear here...</span>
            )}
          </div>
          <div className="word-controls">
            <button onClick={addSpace} className="control-btn">
              ␣ Space
            </button>
            <button onClick={removeLastLetter} className="control-btn">
              ⌫ Backspace
            </button>
            <button onClick={clearWordBuffer} className="control-btn clear">
              🗑️ Clear All
            </button>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          className="instructions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h3>📖 How to Use</h3>
          <div className="instruction-grid">
            <div className="instruction-card">
              <span className="step">1</span>
              <p>Choose upload or webcam mode</p>
            </div>
            <div className="instruction-card">
              <span className="step">2</span>
              <p>Show ISL hand sign clearly</p>
            </div>
            <div className="instruction-card">
              <span className="step">3</span>
              <p>Capture or upload the image</p>
            </div>
            <div className="instruction-card">
              <span className="step">4</span>
              <p>Get instant text translation</p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>Made with ❤️ for the Deaf Community</p>
        <p className="tech-stack">React • FastAPI • TensorFlow</p>
      </footer>
    </div>
  );
}

export default App;
