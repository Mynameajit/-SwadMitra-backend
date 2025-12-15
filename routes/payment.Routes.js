
import express from"express"
import { isAuthenticated } from "../middleware/AuthMiddleware.js"
import { createOrder } from "../controllers/payment.Controller.js"

const router=express.Router()

router.post("/create-order",isAuthenticated,createOrder)

export default router