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
    confirmPassword: "",
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
      "confirmPassword",
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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
    if (!nicRegex.test(formData.nic)) {
      setError("Please enter a valid NIC (9 digits with V/X or 12 digits)");
      return false;
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formData.mobile)) {
      setError("Please enter a valid 10-digit mobile number");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

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

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const { ...userData } = formData;
      const registrationData = {
        ...userData,
        role: "User",
      };

      const response = await axios.post(
        "http://localhost:5001/api/register",
        registrationData
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setEmail(formData.email);
        setStep("verify");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          nic: "",
          mobile: "",
          address: "",
          gender: "",
          dob: "",
          termsAccepted: false,
        });
      }
    } catch (err) {
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
        "http://localhost:5000/api/users/verify-otp",
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
      }
    } catch (err) {
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
        "http://localhost:5000/api/users/resend-otp",
        {
          email,
        }
      );

      if (response.data.success) {
        toast.success("New OTP sent to your email");
      }
    } catch (err) {
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
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
            Verify Your Email
          </h2>
          <p className="text-center text-gray-600 mb-8">
            We've sent a verification code to{" "}
            <span className="font-semibold text-purple-600">{email}</span>
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleVerifyOTP}>
            <div className="mb-6">
              <label
                htmlFor="otp"
                className="block text-gray-700 font-medium mb-2"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl tracking-wider"
                placeholder="000000"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-600 mb-2">Didn't receive the code?</p>
            <button
              type="button"
              onClick={resendOTP}
              disabled={loading}
              className="text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
            >
              Resend OTP
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Create Account
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Join us today! Fill in your details below.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="firstName"
                className="block text-gray-700 font-medium mb-2"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-gray-700 font-medium mb-2"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter last name"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-2"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="nic"
                className="block text-gray-700 font-medium mb-2"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., 123456789V or 123456789012"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: 9 digits + V/X or 12 digits
              </p>
            </div>

            <div>
              <label
                htmlFor="mobile"
                className="block text-gray-700 font-medium mb-2"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="10-digit mobile number"
              />
            </div>

            <div>
              <label
                htmlFor="gender"
                className="block text-gray-700 font-medium mb-2"
              >
                Gender *
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="dob"
                className="block text-gray-700 font-medium mb-2"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                You must be at least 18 years old
              </p>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="address"
                className="block text-gray-700 font-medium mb-2"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
                placeholder="Enter your full address"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 font-medium mb-2"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-gray-700 font-medium mb-2"
              >
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Confirm your password"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  required
                  className="w-5 h-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-gray-700">
                  I accept the{" "}
                  <Link
                    to="/terms"
                    className="text-purple-600 hover:text-purple-700"
                  >
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-purple-600 hover:text-purple-700"
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
            className="w-full mt-8 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
