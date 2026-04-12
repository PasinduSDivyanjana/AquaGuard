💧 AquaGuard – Well Monitoring System

Full Stack Well Monitoring & Management Platform using React (Frontend) and Node.js + Express + MongoDB (Backend)

🚀 Project Overview

AquaGuard is a modern Well Monitoring System developed to streamline the monitoring, management, and maintenance of water wells.

The platform enables organizations, administrators, and field personnel to:

📍 Register and manage water wells
📊 Monitor well conditions and operational status
📝 Record well inspection and maintenance data
🚨 Report issues related to wells
🌦️ View weather conditions relevant to well locations
🗺️ Visualize wells on interactive maps
📈 Track status updates and historical records
👨‍💼 Manage all wells through an admin dashboard
📂 Upload supporting images/files for well reports

AquaGuard improves transparency, operational efficiency, and accessibility of water well monitoring data for organizations and communities.

Repository:
https://github.com/PasinduSDivyanjana/AquaGuard/

🛠️ Tech Stack

**Frontend**

React.js
Tailwind CSS
Axios
React Router DOM

**Backend**

Node.js
Express.js

**Database**

MongoDB
Mongoose ODM

**APIs / External Services**

Leaflet.js – Interactive Map Visualization
Google Maps API – Location & Geocoding Services
WeatherAPI – Weather Data Integration
Cloudinary – Image/File Upload & Storage

**📂 Project Structure**

AquaGuard/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── assets/
│   │   └── App.jsx
│   └── package.json
│
└── README.md

**⚙️ Setup Instructions**

🔹 1️⃣ Clone the Repository

git clone https://github.com/PasinduSDivyanjana/AquaGuard.git
cd AquaGuard

🖥️ Backend Setup

📌 Prerequisites

Node.js (v18+ Recommended)
MongoDB Installed / MongoDB Atlas URI

▶️ Steps

cd backend
npm install
npm run dev

Backend runs at:

http://localhost:5001

🌐 Frontend Setup

▶️ Steps

cd frontend
npm install
npm run dev

Frontend runs at:

http://localhost:5173

📬 API Endpoints

GET	 - /api/wells	 - Retrieve all wells
GET	 - /api/wells/:id - Retrieve specific well details
POST - /api/wells - Register a new well
PUT - /api/wells/:id - Update well information
DELETE - /api/wells/:id - Remove a well
GET - /api/reports - Retrieve all reports
POST - /api/reports - Submit new well issue/maintenance report
PUT - /api/reports/:id - Update report status

**📦 Important Dependencies**

**Frontend**

npm install axios react-router-dom
npm install tailwindcss
npm install leaflet react-leaflet
npm install @react-google-maps/api

**Backend**

npm install express cors dotenv mongoose
npm install multer cloudinary
npm install axios

**✨ Key Features**

Well Registration & Management
Real-Time Well Status Monitoring
Maintenance / Inspection Record Tracking
Issue Reporting & Complaint Logging
Interactive Map-Based Well Visualization
Weather Monitoring for Well Locations
Image/File Upload Support via Cloudinary
Admin Dashboard for Centralized Monitoring

**📄 Deliverables**

The repository includes:

✅ Complete Source Code
✅ Frontend + Backend Integration
✅ MongoDB Database Integration
✅ Third-Party API Integrations
✅ Setup Documentation

**👨‍💻 Developed For**

3rd Year 1st Semester Project
Software Engineering Project
