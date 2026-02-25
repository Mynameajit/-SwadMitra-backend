import User from "../models/User.Models.js";
import bcrypt from "bcrypt";
import { setToken } from "../utils/setToken.js";

/**
 * =========================================================
 * CUSTOMER SIGNUP
 * =========================================================
 * Purpose:
 * - Customer (normal user) ka account create karna
 * - role = "user" (model default)
 * - status = "approved" (customer ko direct app access)
 *
 * Flow:
 * 1. Email already exist check
 * 2. Password hash
 * 3. User create
 * 4. JWT token set (cookie)
 */
export const SignUp = async (req, res) => {
    try {
        const { fullName, email, mobile, password } = req.body;

        /* ================= VALIDATION ================= */
        if (!fullName || !email || !mobile || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        /* ================= CHECK EXISTING USER ================= */
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        /* ================= PASSWORD HASH ================= */
        const hashedPassword = await bcrypt.hash(password, 10);

        /* ================= CREATE USER ================= */
        const newUser = await User.create({
            fullName,
            email,
            mobile,
            password: hashedPassword,
           userData:true,
            status: "approved", // 🔥 customer ko direct access
        });

        /* ================= TOKEN & RESPONSE ================= */
        setToken(newUser, res, 200, "User registered successfully", "user_token");

    } catch (error) {
        console.error("Customer signup error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

/**
 * =========================================================
 * CUSTOMER SIGNIN
 * =========================================================
 * Purpose:
 * - Customer app login
 *
 * Important Rules:
 * - Dashboard roles (owner/delivery/admin) NOT allowed
 * - Blocked / inactive user not allowed
 *
 * Flow:
 * 1. User find by email
 * 2. Role check (only "user")
 * 3. Account active & not blocked
 * 4. Password verify
 * 5. Token set
 */
export const Signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        /* ================= VALIDATION ================= */
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        /* ================= FIND USER ================= */
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }

        /* ================= ROLE CHECK ================= */
        // ❌ Owner / Delivery / Admin dashboard users
        if (user.role !== "user") {
            return res.status(403).json({
                success: false,
                message: "Please login from dashboard",
            });
        }

        /* ================= ACCOUNT STATUS CHECK ================= */
        if (!user.isActive || user.status === "blocked") {
            return res.status(403).json({
                success: false,
                message: "Your account is blocked",
            });
        }

        /* ================= PASSWORD VERIFY ================= */
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        /* ================= LOGIN SUCCESS ================= */
        setToken(user, res, 200, "Signin successful", "user_token");

    } catch (error) {
        console.error("Customer signin error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

/**
 * =========================================================
 * GET CURRENT USER PROFILE
 * =========================================================
 * Purpose:
 * - Logged-in user ka profile fetch karna
 * - JWT middleware se `req.user` aata hai
 *
 * Security:
 * - Password & internal fields removed
 */
export const getUser = async (req, res) => {
    try {
        const userId = req.user._id; // JWT middleware se

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
            message: "User profile fetched successfully",
            user,
        });
    } catch (error) {
        console.error("Get user error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

/**
 * =========================================================
 * USER SIGNOUT
 * =========================================================
 * Purpose:
 * - JWT cookie clear karna
 * - Client side logout
 */
export const Signout = (req, res) => {
    try {
        res.clearCookie("user_token");
        return res.status(200).json({
            success: true,
            message: "Signout successful",
        });
    } catch (error) {
        console.error("Signout error:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};
