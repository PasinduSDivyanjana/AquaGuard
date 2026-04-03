import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      default: uuidv4,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    nic: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    termsAccepted: {
      type: Boolean,
      required: true,
    },

    // 🔹 Role
    role: {
      type: String,
      enum: ["User", "Admin", "Villager", "Reporter"],
      default: "User",
    },

    // 🔐 OTP Fields (NEW)
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    //Login OTP
    loginOtp: {
      type: String,
    },
    loginOtpExpires: {
      type: Date,
    },

    //Forgot Password Fields
    resetPasswordToken: {
      type: String,
    },

    resetPasswordOTP: {
      type: String,
    },

    resetPasswordExpire: {
      type: Date,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    const lastUser = await this.constructor
      .findOne({})
      .sort({ createdAt: -1 })
      .select("userId");

    let nextId = "C001";

    if (lastUser?.userId) {
      const lastNum = parseInt(lastUser.userId.slice(1), 10);
      nextId = `C${String(lastNum + 1).padStart(3, "0")}`;
    }

    this.userId = nextId;
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.model("User", userSchema);
export default User;
