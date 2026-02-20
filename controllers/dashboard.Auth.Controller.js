
import User from "../models/User.Models.js";
import { setDashboardToken } from "../utils/setdDashboardToken.js";
import bcrypt from "bcrypt"


/**
 * =================================================
 * OWNER REGISTER (DASHBOARD)
 * =================================================
 * Purpose:
 * - Owner ka basic account create karna
 * - Sirf email / password / mobile / name
 *
 * Important:
 * - role = "owner"
 * - status = "incomplete"
 *   (kyunki restaurant details abhi fill nahi hui)
 *
 * Next Step:
 * - Login ke baad restaurant details form open hoga
 */



export const registerOwner = async (req, res) => {
    try {
        const { fullName, email, password, mobile } = req.body||{}
        /* ========== BASIC VALIDATION ========== */
        if (!fullName || !email || !mobile || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        /* ========== CHECK EXISTING USER ========== */
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered",
            });
        }

        /* ========== HASH PASSWORD ========== */
        const hashedPassword = await bcrypt.hash(password, 10);

        /* ========== CREATE OWNER USER ========== */

        const owner = await User.create({
            fullName,
            email,
            mobile,
            password: hashedPassword,
            role: "owner",
            status: "incomplete"
        })

        /* ===== TOKEN + RESPONSE ===== */
        return setDashboardToken(
            owner,
            res,
            201,
            "Owner registered successfully. Please complete restaurant details.",
            "dashboard_token" 
        );



    } catch (error) {
        console.error("Owner register error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};


export const dashboardLogin = async (req, res) => {
    try {
        const { email, password } = req.body||{}

        /* ===== BASIC VALIDATION ===== */
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        /* ===== FIND USER ===== */
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            })
        }

        if (!["owner", "delivery", "admin"].includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: "Please login from customer app",
            });
        }
        /* ===== ACCOUNT STATUS CHECK ===== */
        if (!user.isActive || user.status === "blocked") {
            return res.status(403).json({
                success: false,
                message: "Your account is blocked",
            });
        }

        /* ===== PASSWORD VERIFY ===== */
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        /* ===== TOKEN + RESPONSE ===== */
        return setDashboardToken(
            user,
            res,
            200,
            "Dashboard login successful",
            "dashboard_token" 
        );

    } catch (error) {
        console.error("Dashboard signin error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};


/**
 * =================================================
 * GET CURRENT LOGGED-IN USER
 * =================================================
 * Purpose:
 * - Cookie se JWT verify hone ke baad
 * - Current user ka data return karna
 *
 * Used for:
 * - Page refresh auth restore
 * - Redux rehydrate
 */
export const getCurrentUser = async (req, res) => {

  try {
    // req.user middleware (JWT verify) se aata hai
    const userId = req.user._id;

    const user = await User.findById(userId).select(
      "-password -__v"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


/**
 * ===============================
 * DASHBOARD LOGOUT
 * ===============================
 * Purpose:
 * - dashboard_token cookie clear karna
 * - owner / delivery dashboard logout
 */
export const logoutDashboard = (req, res) => {
  try {
    res.clearCookie("dashboard_token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Dashboard logout successful",
    });
  } catch (error) {
    console.error("Dashboard logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

