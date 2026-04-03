import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState("login");

  const [formData, setFormData] = useState({ email: "", password: "" });

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // LOGIN
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

  // VERIFY LOGIN OTP
  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axiosInstance.post("/user/verify-login-otp", {
        email,
        otp,
      });

      if (res.data.success) {
        const user = res.data.user;

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(user));

        toast.success("Login successful!");

        switch (user.role) {
          case "Admin":
            navigate("/adminDashboard");
            break;

          case "Reporter":
            navigate("/reporterDashboard");
            break;

          case "User":
          default:
            navigate("/userDashboard");
            break;
        }
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // FORGOT EMAIL
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

  // VERIFY FORGOT OTP
  const handleVerifyForgotOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      setStep("resetPassword");
      toast.success("OTP verified");
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("OTP error");
    } finally {
      setLoading(false);
    }
  };

  // RESET PASSWORD
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

  const getStepTitle = () => {
    switch (step) {
      case "login":
        return "Welcome Back";
      case "verify":
        return "Verify OTP";
      case "forgotEmail":
        return "Forgot Password";
      case "forgotOtp":
        return "Verify OTP";
      case "resetPassword":
        return "Reset Password";
      default:
        return "";
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case "login":
        return "Sign in to your account";
      case "verify":
        return `Enter the 6-digit code sent to ${email}`;
      case "forgotEmail":
        return "Enter your email to receive OTP";
      case "forgotOtp":
        return "Enter the OTP sent to your email";
      case "resetPassword":
        return "Create your new password";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0E19] to-[#101624] relative overflow-hidden">
      {/* Ambient glow effects with brand colors */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#F5BD27]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#4BDA7F]/5 rounded-full blur-3xl"></div>

      <div className="relative w-full max-w-md mx-4">
        {/* Card with enhanced styling */}
        <div className="bg-[#101624] rounded-2xl shadow-2xl border border-[#172431] overflow-hidden backdrop-blur-sm">
          {/* Decorative top bar - using brand gold and green */}
          <div className="h-1 bg-gradient-to-r from-[#F5BD27] via-[#4BDA7F] to-[#F5BD27]"></div>

          {/* Logo/Icon Section - using gold gradient */}
          <div className="flex justify-center mt-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#F5BD27] to-[#E6C27A] rounded-xl flex items-center justify-center shadow-lg">
              <svg
                className="w-8 h-8 text-[#0A0E19]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z" />
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mt-6 mb-8 px-8">
            <h2 className="text-2xl font-bold text-[#FFFFFF] mb-2">
              {getStepTitle()}
            </h2>
            <p className="text-[#9BA0A6] text-sm">{getStepSubtitle()}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-8 mb-4 p-3 bg-[#CA6162]/10 border border-[#CA6162]/20 rounded-lg">
              <p className="text-[#CA6162] text-sm text-center">{error}</p>
            </div>
          )}

          {/* Form Container */}
          <div className="px-8 pb-8">
            {/* LOGIN */}
            {step === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B7280]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <input
                    type="email"
                    placeholder="Email address"
                    className="w-full pl-10 pr-4 py-3 bg-[#0A0E19] border border-[#172431] rounded-lg text-[#FFFFFF] placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-all"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B7280]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full pl-10 pr-4 py-3 bg-[#0A0E19] border border-[#172431] rounded-lg text-[#FFFFFF] placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-all"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#F5BD27] hover:bg-[#E6C27A] text-[#0A0E19] font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : "Sign In"}
                </button>

                <div className="text-center pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => setStep("forgotEmail")}
                    className="text-sm text-[#F5BD27] hover:text-[#E6C27A] transition-colors block w-full"
                  >
                    Forgot Password?
                  </button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#172431]"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-[#101624] text-[#6B7280]">
                        New to AquaGuard?
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="w-full bg-transparent border border-[#F5BD27] text-[#F5BD27] hover:bg-[#F5BD27]/10 font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02]"
                  >
                    Create an Account
                  </button>
                </div>
              </form>
            )}

            {/* LOGIN OTP */}
            {step === "verify" && (
              <form onSubmit={handleVerifyLoginOtp} className="space-y-4">
                <div>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-3 text-center tracking-[0.25em] text-2xl bg-[#0A0E19] border border-[#172431] rounded-lg text-[#FFFFFF] placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-all"
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                  />
                  <p className="text-xs text-[#6B7280] text-center mt-2">
                    Enter the 6-digit verification code
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#4BDA7F] hover:bg-[#178B96] text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("login");
                      setOtp("");
                    }}
                    className="text-sm text-[#9BA0A6] hover:text-[#F5BD27] transition-colors"
                  >
                    ← Back to Login
                  </button>
                </div>
              </form>
            )}

            {/* FORGOT EMAIL */}
            {step === "forgotEmail" && (
              <form onSubmit={handleForgotEmail} className="space-y-4">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B7280]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <input
                    type="email"
                    placeholder="Email address"
                    className="w-full pl-10 pr-4 py-3 bg-[#0A0E19] border border-[#172431] rounded-lg text-[#FFFFFF] placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#F5BD27] hover:bg-[#E6C27A] text-[#0A0E19] font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("login")}
                    className="text-sm text-[#9BA0A6] hover:text-[#F5BD27] transition-colors"
                  >
                    ← Back to Login
                  </button>
                </div>
              </form>
            )}

            {/* FORGOT OTP */}
            {step === "forgotOtp" && (
              <form onSubmit={handleVerifyForgotOtp} className="space-y-4">
                <div>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-3 text-center tracking-[0.25em] text-2xl bg-[#0A0E19] border border-[#172431] rounded-lg text-[#FFFFFF] placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-all"
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                  />
                  <p className="text-xs text-[#6B7280] text-center mt-2">
                    Enter the 6-digit verification code
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#4BDA7F] hover:bg-[#178B96] text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("forgotEmail")}
                    className="text-sm text-[#9BA0A6] hover:text-[#F5BD27] transition-colors"
                  >
                    ← Resend OTP
                  </button>
                </div>
              </form>
            )}

            {/* RESET PASSWORD */}
            {step === "resetPassword" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6B7280]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <input
                    type="password"
                    placeholder="New Password"
                    className="w-full pl-10 pr-4 py-3 bg-[#0A0E19] border border-[#172431] rounded-lg text-[#FFFFFF] placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-all"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#4BDA7F] hover:bg-[#178B96] text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("login");
                      setOtp("");
                      setNewPassword("");
                    }}
                    className="text-sm text-[#9BA0A6] hover:text-[#F5BD27] transition-colors"
                  >
                    ← Back to Login
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 pb-6 pt-4 border-t border-[#172431]">
            <p className="text-center text-[#6B7280] text-xs">
              Secure authentication system
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
