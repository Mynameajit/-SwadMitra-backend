import jwt from "jsonwebtoken";
import User from "../models/User.Models.js";

export const isAuthenticatedDashboard = async (req, res, next) => {
  try {
    const token = req.cookies.dashboard_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Dashboard authentication required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Only dashboard roles allowed
    if (!["owner", "delivery", "admin"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Dashboard access denied",
      });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error("Dashboard auth error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};