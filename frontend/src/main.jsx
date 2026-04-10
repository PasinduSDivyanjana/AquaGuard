import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#172431",
            color: "#F3EFEA",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "10px",
            fontSize: "0.85rem",
            fontFamily: "'Inter', sans-serif",
          },
          success: {
            iconTheme: { primary: "#4BDA7F", secondary: "#0A0E19" },
          },
          error: {
            iconTheme: { primary: "#CA6162", secondary: "#0A0E19" },
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);
