import express from "express"
import { AddItemToCart, clearCart, delateCartItem, getCartItems, updateCartItem } from "../controllers/cart.Controller.js"
import { isAuthenticatedUser } from "../middleware/isAuthenticatedUser.js"

const router = express.Router()

router.post("/add", isAuthenticatedUser, AddItemToCart)
router.get("/get", isAuthenticatedUser, getCartItems)
router.patch("/update/:productId", isAuthenticatedUser, updateCartItem)
router.delete("/delete/:productId", isAuthenticatedUser, delateCartItem)
router.delete("/clear", isAuthenticatedUser, clearCart)


export default router