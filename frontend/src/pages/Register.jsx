import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const Register = () => {
  const [step, setStep] = useState("register");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    nic: "",
    mobile: "",
    address: "",
    gender: "",
    dob: "",
    termsAccepted: false,
  });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validateForm = () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "password",
      "nic",
      "mobile",
      "address",
      "gender",
      "dob",
    ];

    for (let field of requiredFields) {
      if (!formData[field]) {
        setError(
          `Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`
        );
        return false;
      }
    }

    // Password validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    // NIC validation
    const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
    if (!nicRegex.test(formData.nic)) {
      setError("Please enter a valid NIC (9 digits with V/X or 12 digits)");
      return false;
    }

    // Mobile validation
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formData.mobile)) {
      setError("Please enter a valid 10-digit mobile number");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Age validation (must be at least 18)
    const birthDate = new Date(formData.dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    if (age < 18) {
      setError("You must be at least 18 years old to register");
      return false;
    }

    // Terms acceptance
    if (!formData.termsAccepted) {
      setError("You must accept the terms and conditions");
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log(formData);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        nic: formData.nic,
        mobile: formData.mobile,
        address: formData.address,
        gender: formData.gender,
        dob: formData.dob,
        termsAccepted: formData.termsAccepted,
        role: "User",
      };

      console.log("Sending registration data:", registrationData);

      const response = await axios.post(
        "http://localhost:5001/api/user/register",
        registrationData
      );

      if (response.data.success) {
        toast.success(
          response.data.message ||
            "Registration successful! Please verify your email."
        );
        setEmail(formData.email);
        setStep("verify");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          nic: "",
          mobile: "",
          address: "",
          gender: "",
          dob: "",
          termsAccepted: false,
        });
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage = err.response?.data?.message || "Registration failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5001/api/user/verify-registration-otp",
        {
          email,
          otp,
        }
      );

      if (response.data.success) {
        toast.success("Account verified successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        throw new Error(response.data.message || "Verification failed");
      }
    } catch (err) {
      console.error("Verification error:", err);
      const errorMessage = err.response?.data?.message || "Verification failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5001/api/user/resend-registration-otp",
        { email }
      );

      if (response.data.success) {
        toast.success("New OTP sent to your email");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to resend OTP";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (step === "verify") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0E19] to-[#101624] relative overflow-hidden">
        {/* Ambient glow effects */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#F5BD27]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#4BDA7F]/5 rounded-full blur-3xl"></div>

        <div className="relative w-full max-w-md mx-4">
          <div className="bg-[#101624] rounded-2xl shadow-2xl border border-[#172431] overflow-hidden backdrop-blur-sm">
            <div className="h-1 bg-gradient-to-r from-[#F5BD27] via-[#4BDA7F] to-[#F5BD27]"></div>

            <div className="text-center mt-8 mb-8 px-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#F5BD27] to-[#E6C27A] rounded-xl flex items-center justify-center shadow-lg mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-[#0A0E19]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Verify Your Email
              </h2>
              <p className="text-[#9BA0A6] text-sm">
                We've sent a verification code to
              </p>
              <p className="font-semibold text-[#F5BD27] mt-1">{email}</p>
            </div>

            {error && (
              <div className="mx-8 mb-6 p-3 bg-[#CA6162]/10 border border-[#CA6162]/20 rounded-lg">
                <p className="text-[#CA6162] text-sm text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="px-8 pb-8">
              <div className="mb-6">
                <label
                  htmlFor="otp"
                  className="block text-[#9BA0A6] font-medium mb-2 text-sm"
                >
                  Enter OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength="6"
                  className="w-full px-4 py-3 bg-[#0A0E19] border border-[#172431] rounded-lg text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-all text-center text-2xl tracking-wider"
                  placeholder="000000"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4BDA7F] hover:bg-[#178B96] text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>

            <div className="text-center pb-8 pt-4 border-t border-[#172431] mx-8">
              <p className="text-[#9BA0A6] text-sm mb-2">
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={resendOTP}
                disabled={loading}
                className="text-[#F5BD27] hover:text-[#E6C27A] font-medium disabled:opacity-50 transition-colors"
              >
                Resend OTP
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E19] to-[#101624] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#F5BD27]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#4BDA7F]/5 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#178B96]/5 rounded-full blur-3xl"></div>

      <div className="relative w-full max-w-4xl">
        <div className="bg-[#101624] rounded-2xl shadow-2xl border border-[#172431] overflow-hidden backdrop-blur-sm">
          <div className="h-1 bg-gradient-to-r from-[#F5BD27] via-[#4BDA7F] to-[#F5BD27]"></div>

          <div className="text-center mt-8 mb-8 px-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#F5BD27] to-[#E6C27A] rounded-xl flex items-center justify-center shadow-lg mx-auto mb-6">
              <svg
                className="w-8 h-8 text-[#0A0E19]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Create Account
            </h2>
            <p className="text-[#9BA0A6] text-sm">
              Join AquaGuard today! Fill in your details below.
            </p>
          </div>

          {error && (
            <div className="mx-8 mb-6 p-3 bg-[#CA6162]/10 border border-[#CA6162]/20 rounded-lg">
              <p className="text-[#CA6162] text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="px-8 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-[#9BA0A6] font-medium mb-2 text-sm"
                >
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#0A0E19] border border-[#172431] rounded-lg text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-all"
                  placeholder="Enter first name"
                />
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-[#9BA0A6] font-medium mb-2 text-sm"
                >
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#0A0E19] border border-[#172431] rounded-lg text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-all"
                  placeholder="Enter last name"
                />
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label
                  htmlFor="email"
                  className="block text-[#9BA0A6] font-medium mb-2 text-sm"
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#0A0E19] border border-[#172431] rounded-lg text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-all"
                  placeholder="Enter your email"
                />
              </div>

              {/* NIC */}
              <div>
                <label
                  htmlFor="nic"
                  className="block text-[#9BA0A6] font-medium mb-2 text-sm"
                >
                  NIC Number *
                </label>
                <input
                  type="text"
                  id="nic"
                  name="nic"
                  value={formData.nic}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#0A0E19] border border-[#172431] rounded-lg text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-all"
                  placeholder="e.g., 123456789V or 123456789012"
                />
                <p className="text-xs text-[#6B7280] mt-1">
                  Format: 9 digits + V/X or 12 digits
                </p>
              </div>

              {/* Mobile */}
              <div>
                <label
                  htmlFor="mobile"
                  className="block text-[#9BA0A6] font-medium mb-2 text-sm"
                >
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#0A0E19] border border-[#172431] rounded-lg text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-all"
                  placeholder="10-digit mobile number"
                />
              </div>

              {/* Gender */}
              <div>
                <label
                  htmlFor="gender"
                  className="block text-[#9BA0A6] font-medium mb-2 text-sm"
                >
                  Gender *
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#0A0E19] border border-[#172431] rounded-lg text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-all"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div>
                <label
                  htmlFor="dob"
                  className="block text-[#9BA0A6] font-medium mb-2 text-sm"
                >
                  Date of Birth *
                </label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#0A0E19] border border-[#172431] rounded-lg text-white focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-all"
                />
                <p className="text-xs text-[#6B7280] mt-1">
                  You must be at least 18 years old
                </p>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label
                  htmlFor="address"
                  className="block text-[#9BA0A6] font-medium mb-2 text-sm"
                >
                  Address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-4 py-3 bg-[#0A0E19] border border-[#172431] rounded-lg text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-all resize-vertical"
                  placeholder="Enter your full address"
                />
              </div>

              {/* Password */}
              <div className="md:col-span-2">
                <label
                  htmlFor="password"
                  className="block text-[#9BA0A6] font-medium mb-2 text-sm"
                >
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#0A0E19] border border-[#172431] rounded-lg text-white placeholder-[#6B7280] focus:outline-none focus:border-[#F5BD27] focus:ring-1 focus:ring-[#F5BD27] transition-all"
                  placeholder="Minimum 6 characters"
                />
              </div>

              {/* Terms and Conditions */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    required
                    className="w-5 h-5 text-[#F5BD27] focus:ring-[#F5BD27] border-[#172431] rounded bg-[#0A0E19]"
                  />
                  <span className="text-[#9BA0A6] text-sm">
                    I accept the{" "}
                    <Link
                      to="/terms"
                      className="text-[#F5BD27] hover:text-[#E6C27A] transition-colors"
                    >
                      Terms and Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="text-[#F5BD27] hover:text-[#E6C27A] transition-colors"
                    >
                      Privacy Policy
                    </Link>{" "}
                    *
                  </span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-[#F5BD27] hover:bg-[#E6C27A] text-[#0A0E19] font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registering..." : "Create Account"}
            </button>
          </form>

          <div className="px-8 pb-8 pt-4 border-t border-[#172431]">
            <p className="text-center text-[#9BA0A6] text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#F5BD27] hover:text-[#E6C27A] font-medium transition-colors"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
