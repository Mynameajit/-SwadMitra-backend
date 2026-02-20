import { Router } from "express";
import { dashboardLogin, getCurrentUser, logoutDashboard, registerOwner } from "../controllers/dashboard.Auth.Controller.js";
import { isAuthenticatedDashboard } from "../middleware/isAuthenticatedDashboard.js";

const router = Router();

router.post("/register-owner", registerOwner);
router.post("/login-owner", dashboardLogin);
router.get("/me",isAuthenticatedDashboard, getCurrentUser);
router.get("/logout",isAuthenticatedDashboard, logoutDashboard);

export default router;