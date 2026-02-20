import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: { 
      type: String,
      enum: ["user", "admin", "owner", "delivery"],
      default: "user",
    },

    // 🔥 Dashboard approval flow ke liye MOST IMPORTANT
    status: {
      type: String,
      enum: ["incomplete", "pending", "approved", "rejected", "blocked"],
      default: "incomplete",
    },

    // Email verified ya nahi (simple true/false)
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Admin soft control (block / unblock)
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
