import express from "express";
import {
  placeOrder,
  getUserOrders,
  getOwnerOrders,
  updateShopOrderStatus,
  cancelShopOrderByUser,
} from "../controllers/order.Controller.js";

import { isAuthenticatedUser } from "../middleware/isAuthenticatedUser.js";
import { isAuthenticatedDashboard } from "../middleware/isAuthenticatedDashboard.js";

const router = express.Router();

/* ==================================================
   PLACE ORDER (USER)
   POST /api/order/place
================================================== */
router.post(
  "/place",
  isAuthenticatedUser,
  placeOrder
);

/* ==================================================
   USER GET ORDERS
   GET /api/order/user
================================================== */
router.get(
  "/user",
  isAuthenticatedUser,
  getUserOrders
);

/* ==================================================
   USER CANCEL SHOP ORDER (FULL SHOP CANCEL)
   PATCH /api/order/user/cancel/:orderId/:shopOrderId
================================================== */
router.patch(
  "/user/cancel/:orderId/:shopOrderId",
  isAuthenticatedUser,
  cancelShopOrderByUser
);

/* ==================================================
   OWNER GET ORDERS
   GET /api/order/owner
================================================== */
router.get(
  "/owner",
  isAuthenticatedDashboard,
  getOwnerOrders
);

/* ==================================================
   OWNER UPDATE SHOP STATUS
   PATCH /api/order/owner/update-status/:orderId/:shopOrderId
================================================== */
router.patch(
  "/owner/update-status/:orderId/:shopOrderId",
  isAuthenticatedDashboard,
  updateShopOrderStatus
);

export default router;
