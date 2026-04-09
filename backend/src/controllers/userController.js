import User from "../models/User.js";
import bcrypt from "bcrypt";
import { sendRegistrationOTPEmail } from "../config/email.js";

// ✅ Create User
export const createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      nic,
      mobile,
      address,
      gender,
      dob,
      termsAccepted,
    } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // 🔥 Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 👤 Create USER (NOT VERIFIED YET)
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      nic,
      mobile,
      address,
      gender,
      dob,
      termsAccepted,
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000, // 5 min
      isVerified: false,
    });

    // 📧 Send OTP email
    await sendRegistrationOTPEmail(email, otp);

    return res.status(201).json({
      success: true,
      message: "OTP sent to email. Please verify your account.",
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

//OTP Generator
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

//Registration OTP Verification
export const verifyRegistrationOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account already verified",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Account verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// ✅ Get User By ID
export const getUserByID = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
};

// ✅ Update User
export const updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };

    // ✅ If password is being updated, hash it
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser._doc;

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: userWithoutPassword,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
};

// ✅ Delete User
export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

//Getprofile controller
export const getProfile = async (req, res) => {
  try {
    // req.user is set by 'protect' middleware after JWT verification
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: req.user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};
