import User from "../models/User.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendLoginOTPEmail, sendResetEmail } from "../config/email.js";
import { generateToken } from "../utils/generateToken.js";

// ✅ Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.isVerified) {
      return res
        .status(401)
        .json({ success: false, message: "Please verify email first" });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate login OTP
    const otp = generateOTP();
    user.loginOtp = otp;
    user.loginOtpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    // Send OTP email
    await sendLoginOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify to complete login.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Login failed", error: error.message });
  }
};

//OTP Generator
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

//Login OTP verification
export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.loginOtp || !user.loginOtpExpires) {
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please login again.",
      });
    }

    if (user.loginOtp !== otp.toString()) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.loginOtpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    user.loginOtp = null;
    user.loginOtpExpires = null;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    //Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    //Generate secure token for reset link
    const resetToken = crypto.randomBytes(32).toString("hex");

    //Generate 6-digit OTP
    const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();

    //Save token, OTP, and expiry in DB
    user.resetPasswordToken = resetToken;
    user.resetPasswordOTP = resetOTP;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    //Create reset link
    const resetLink = `http://localhost:5001/reset-password/${resetToken}`;

    //Send email with reset link and OTP
    await sendResetEmail(user.email, resetLink, resetOTP);

    res.status(200).json({
      success: true,
      message: "Password reset email sent with OTP and link",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Forgot password failed",
      error: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, password, resetToken, resetOTP } = req.body;

    //Validate required fields
    if (!email || !password || (!resetToken && !resetOTP)) {
      return res.status(400).json({
        success: false,
        message:
          "Email, password, and either resetToken or resetOTP are required",
      });
    }

    //Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    //Check token or OTP validity
    const isTokenValid =
      resetToken &&
      user.resetPasswordToken === resetToken &&
      user.resetPasswordExpire > Date.now();

    const isOTPValid =
      resetOTP &&
      user.resetPasswordOTP === resetOTP &&
      user.resetPasswordExpire > Date.now();

    if (!isTokenValid && !isOTPValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token/OTP",
      });
    }

    //Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    //Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Password reset failed",
      error: error.message,
    });
  }
};
