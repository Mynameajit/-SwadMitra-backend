
import express from"express"
import { createOrder, verifyPayment } from "../controllers/payment.Controller.js"
import { isAuthenticatedUser } from "../middleware/isAuthenticatedUser.js"

const router=express.Router()

router.post("/create-order",isAuthenticatedUser,createOrder)
router.post("/verify", verifyPayment);

export default router