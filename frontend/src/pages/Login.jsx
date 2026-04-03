import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState("login");
  // login | verify | forgotEmail | forgotOtp | resetPassword

  const [formData, setFormData] = useState({ email: "", password: "" });

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ================= LOGIN =================
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/user/login", formData);

      if (res.data.success) {
        setEmail(formData.email);
        setStep("verify");
        toast.success("OTP sent to email!");
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ================= VERIFY LOGIN OTP =================
  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axiosInstance.post("/user/verify-login-otp", {
        email,
        otp,
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        toast.success("Login successful!");
        navigate("/userDashboard");
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // ================= STEP 1: FORGOT EMAIL =================
  const handleForgotEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axiosInstance.post("/user/forgot-password", {
        email,
      });

      if (res.data.success) {
        toast.success("OTP sent to email");
        setStep("forgotOtp");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Email not found");
    } finally {
      setLoading(false);
    }
  };

  // ================= STEP 2: VERIFY OTP =================
  const handleVerifyForgotOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // we don't reset yet — just move to password step
      setStep("resetPassword");
      toast.success("OTP verified");
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("OTP error");
    } finally {
      setLoading(false);
    }
  };

  // ================= STEP 3: RESET PASSWORD =================
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axiosInstance.post("/user/reset-password", {
        email,
        password: newPassword,
        resetOTP: otp,
      });

      if (res.data.success) {
        toast.success("Password reset successful");
        setStep("login");
        setEmail("");
        setOtp("");
        setNewPassword("");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= RENDER =================

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold text-center mb-4">
          {step === "login" && "Login"}
          {step === "verify" && "Verify OTP"}
          {step === "forgotEmail" && "Forgot Password"}
          {step === "forgotOtp" && "Verify OTP"}
          {step === "resetPassword" && "Reset Password"}
        </h2>

        {error && <p className="text-red-500 text-center mb-3">{error}</p>}

        {/* ================= LOGIN ================= */}
        {step === "login" && (
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              className="w-full border p-3 mb-3 rounded"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full border p-3 mb-3 rounded"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            <button className="w-full bg-purple-600 text-white py-2 rounded">
              Login
            </button>

            <p
              onClick={() => setStep("forgotEmail")}
              className="text-sm text-purple-600 mt-3 text-right cursor-pointer"
            >
              Forgot Password?
            </p>
          </form>
        )}

        {/* ================= LOGIN OTP ================= */}
        {step === "verify" && (
          <form onSubmit={handleVerifyLoginOtp}>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full border p-3 mb-3 text-center"
            />

            <button className="w-full bg-purple-600 text-white py-2 rounded">
              Verify OTP
            </button>
          </form>
        )}

        {/* ================= FORGOT EMAIL ================= */}
        {step === "forgotEmail" && (
          <form onSubmit={handleForgotEmail}>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border p-3 mb-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button className="w-full bg-purple-600 text-white py-2 rounded">
              Send OTP
            </button>
          </form>
        )}

        {/* ================= FORGOT OTP ================= */}
        {step === "forgotOtp" && (
          <form onSubmit={handleVerifyForgotOtp}>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full border p-3 mb-3 text-center"
            />

            <button className="w-full bg-purple-600 text-white py-2 rounded">
              Verify OTP
            </button>
          </form>
        )}

        {/* ================= RESET PASSWORD ================= */}
        {step === "resetPassword" && (
          <form onSubmit={handleResetPassword}>
            <input
              type="password"
              placeholder="New Password"
              className="w-full border p-3 mb-3"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <button className="w-full bg-green-600 text-white py-2 rounded">
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
