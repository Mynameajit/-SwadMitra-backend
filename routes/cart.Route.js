import express from "express"
import { isAuthenticated } from "../middleware/AuthMiddleware.js"
import { AddItemToCart, ClearAllCartItems, delateCartItem, getCartItems, updateCartItem } from "../controllers/cart.Controller.js"

const router = express.Router()

router.post("/add", isAuthenticated, AddItemToCart)
router.get("/get", isAuthenticated, getCartItems)
router.post("/update/:productId", isAuthenticated, updateCartItem)
router.post("/delate/:productId", isAuthenticated, delateCartItem)
router.post("/clear", isAuthenticated, ClearAllCartItems)


export default router