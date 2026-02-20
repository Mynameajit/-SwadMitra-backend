import express from "express";
import {
  createItem,
  updateItem,
  deleteItem,
  getAllItems,
  getItemByShopId,
  getItemsByCity,
  getMyItems,
} from "../controllers/item.Controller.js";
import { upload } from "../middleware/multer.js";
import { isAuthenticatedDashboard } from "../middleware/isAuthenticatedDashboard.js";

const router = express.Router();

/* ================= OWNER ROUTES ================= */

// Create item
router.post(
  "/create",
  isAuthenticatedDashboard,
  upload.single("image"),
  createItem
);

// Update item
router.put(
  "/update/:itemId",
  isAuthenticatedDashboard,
  upload.single("image"),
  updateItem
);

// Soft delete item
router.delete(
  "/delete/:itemId",
  isAuthenticatedDashboard,
  deleteItem
);

// 🔥 Owner dashboard items
router.get(
  "/my-items",
  isAuthenticatedDashboard,
  getMyItems
);

/* ================= PUBLIC ROUTES ================= */

// Get items by shop
router.get(
  "/shop/:shopId",
  getItemByShopId
);

// Get all items  (pagination)
router.get(
  "/",
  getAllItems
);

// Get items by city
router.get(
  "/city/:city",
  getItemsByCity
);

export default router;
