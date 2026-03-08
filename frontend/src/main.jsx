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
          style: { borderRadius: '12px', padding: '14px 18px' },
          success: { iconTheme: { primary: '#0d9488' } },
          error: { iconTheme: { primary: '#e11d48' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
