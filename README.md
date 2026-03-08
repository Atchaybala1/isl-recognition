# 🤟 Indian Sign Language Recognition

A full-stack application that converts Indian Sign Language (ISL) gestures to text, helping the deaf and hard-of-hearing community communicate more effectively.

## ✨ Features

- 📸 **Real-time webcam capture** - Capture signs directly from your webcam
- 📁 **Image upload** - Upload existing images for recognition
- 🔤 **Word builder** - Build words letter by letter
- 📊 **Confidence scores** - See prediction confidence levels
- 📱 **Responsive design** - Works on desktop and mobile

## 🛠️ Tech Stack

- **Frontend**: React, Framer Motion
- **Backend**: FastAPI, TensorFlow
- **ML Model**: Custom CNN for ISL recognition
- **Deployment**: Render.com

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- ISL Dataset

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
