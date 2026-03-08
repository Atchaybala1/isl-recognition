import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import './ImageUpload.css';

function ImageUpload({ onImageSelect, loading }) {
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      onImageSelect(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="image-upload">
      <div
        className={`drop-zone ${dragActive ? 'active' : ''} ${preview ? 'has-preview' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="file-input"
        />
        
        {preview ? (
          <motion.div 
            className="preview-container"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <img src={preview} alt="Preview" className="preview-image" />
            {loading && (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <p>Analyzing sign...</p>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="upload-prompt">
            <span className="upload-icon">📤</span>
            <h3>Drop your image here</h3>
            <p>or click to browse</p>
            <span className="supported-formats">
              Supports: JPG, PNG, GIF, WebP
            </span>
          </div>
        )}
      </div>

      {preview && !loading && (
        <motion.button
          className="upload-another"
          onClick={(e) => {
            e.stopPropagation();
            setPreview(null);
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Upload Another Image
        </motion.button>
      )}
    </div>
  );
}

export default ImageUpload;
