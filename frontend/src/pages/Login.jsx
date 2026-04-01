import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const Login = () => {
  const [step, setStep] = useState("login");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5001/api/user/login",
        formData
      );

      if (res.data.success) {
        setEmail(formData.email);
        setStep("verify");
        toast.success("OTP sent to your email!");
        setFormData({ ...formData, password: "" });
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid email or password";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5001/api/user/verify-login-otp",
        { email, otp }
      );

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.success("Login successful!");
        navigate("/userDashboard");
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid or expired OTP";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const resendOTP = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5001/api/user/resend-login-otp",
        { email }
      );

      if (res.data.success) {
        toast.success("New OTP sent!");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to resend OTP";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ================= OTP SCREEN =================
  if (step === "verify") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h2 className="text-xl font-bold text-center mb-4">Verify OTP</h2>
          <p className="text-center text-gray-600 mb-4">
            Sent to <span className="font-semibold">{email}</span>
          </p>

          {error && (
            <div className="text-red-500 text-center mb-3">{error}</div>
          )}

          <form onSubmit={handleVerifyOTP}>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
              required
              placeholder="Enter OTP"
              className="w-full border p-3 rounded-lg text-center mb-4"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg"
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
          </form>

          <div className="text-center mt-4">
            <button onClick={resendOTP} className="text-purple-600">
              Resend OTP
            </button>
          </div>

          <div className="text-center mt-2">
            <button
              onClick={() => setStep("login")}
              className="text-gray-500 text-sm"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= LOGIN SCREEN =================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-2">Welcome Back</h2>
        <p className="text-center text-gray-600 mb-6">Login to your account</p>

        {error && <div className="text-red-500 text-center mb-3">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            className="w-full border p-3 rounded-lg mb-4"
          />

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            className="w-full border p-3 rounded-lg mb-4"
          />

          <div className="text-right mb-4">
            <Link to="/forgot-password" className="text-sm text-purple-600">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600 mb-2">New user?</p>
          <Link to="/register" className="text-purple-600 font-semibold">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
