import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            padding: '14px 18px',
            background: '#101624',
            color: '#FFFFFF',
            border: '1px solid rgba(255,255,255,0.12)',
          },
          success: { iconTheme: { primary: '#4BDA7F' } },
          error: { iconTheme: { primary: '#CA6162' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
