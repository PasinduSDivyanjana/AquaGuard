# 💧 AquaGuard – Well Monitoring System

> A full-stack water well monitoring and management platform built using the MERN stack to improve transparency, tracking, and maintenance of water resources.

---

## 🌍 Overview

**AquaGuard** is a modern web-based system designed to streamline the monitoring and management of water wells. It enables administrators and field personnel to efficiently track well conditions, record maintenance activities, and respond to issues in real time.

The system enhances **data accessibility, operational efficiency, and decision-making** for organizations managing water resources.

---

## ✨ Features

- 📍 Well Registration & Management  
- 📊 Real-Time Well Status Monitoring  
- 📝 Inspection & Maintenance Records  
- 🚨 Issue Reporting System  
- 🌦️ Weather Data Integration  
- 🗺️ Interactive Map Visualization  
- 📈 Historical Data Tracking  
- 👨‍💼 Admin Dashboard  
- 📂 Image/File Upload (Cloud Storage)  

---

## 🛠️ Tech Stack

### 🎨 Frontend
- React.js  
- Tailwind CSS  
- Axios  
- React Router DOM  

### ⚙️ Backend
- Node.js  
- Express.js  

### 🗄️ Database
- MongoDB (Mongoose ODM)

### 🔗 External APIs & Services
- Leaflet.js – Interactive Maps  
- Google Maps API – Location Services  
- WeatherAPI – Weather Data  
- Cloudinary – Image & File Upload  

---

## 📂 Project Structure

```

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
│
├── package.json
└── README.md

````

---

## ⚙️ Installation & Setup

### 🔹 Clone the Repository

```bash
git clone https://github.com/PasinduSDivyanjana/AquaGuard.git
cd AquaGuard
````

---

### 🖥️ Backend Setup

#### Prerequisites

* Node.js (v18+ recommended)
* MongoDB (Local or Atlas)

#### Steps

```bash
cd backend
npm install
npm run dev
```

Backend runs on:
[http://localhost:5001](http://localhost:5001)

---

### 🌐 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:
[http://localhost:5173](http://localhost:5173)

---

## 📬 API Endpoints

### 🛢️ Wells

* GET /api/wells → Get all wells
* GET /api/wells/:id → Get well by ID
* POST /api/wells → Create well
* PUT /api/wells/:id → Update well
* DELETE /api/wells/:id → Delete well

### 📝 Reports

* GET /api/reports → Get all reports
* POST /api/reports → Create report
* PUT /api/reports/:id → Update report

---

## 📦 Key Dependencies

### Frontend

```bash
npm install axios react-router-dom tailwindcss leaflet react-leaflet @react-google-maps/api
```

### Backend

```bash
npm install express cors dotenv mongoose multer cloudinary axios
```

---

## 📊 System Highlights

* Full-stack MERN architecture
* Real-time monitoring system
* Modular and scalable structure
* API integrations (Maps, Weather, Cloudinary)
* Clean and responsive UI

---

## 📸 Future Enhancements

* Authentication & Role-Based Access
* Mobile Application
* IoT Integration for Live Sensor Data
* Advanced Analytics Dashboard

---

## 👨‍💻 Developed For

3rd Year – Software Engineering Project
