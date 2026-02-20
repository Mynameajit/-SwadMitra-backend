import jwt from "jsonwebtoken";
import User from "../models/User.Models.js";

export const isAuthenticatedUser = async (req, res, next) => {
    try {
        const token = req.cookies.user_token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
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

        // ❌ dashboard roles not allowed
        if (user.role !== "user") {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access",
            });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error("User auth error:", error.message);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};
