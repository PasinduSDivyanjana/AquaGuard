import React, { useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { AuthContext } from "../context/AuthContext";

export const Layout = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex bg-dark-bg min-h-screen text-gray-200 font-sans">
      <Sidebar />
      
      <div className="ml-64 flex-1 flex flex-col relative w-[calc(100%-16rem)] overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-aqua/5 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -z-10" />

        <Navbar />
        
        <main className="flex-1 p-8 overflow-y-auto w-[calc(100vw-16rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
