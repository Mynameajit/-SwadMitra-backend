
import Cart from "../models/cart.Models.js";

export const AddItemToCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { item, qty } = req.body;

        if (!item || !qty) {
            return res.status(400).json({
                success: false,
                message: "Item and quantity required",
            });
        }

        const {
            name,
            originalPrice,
            finalPrice,
            image,
            shop,
            _id,
            foodType,
            rating,
            discount,
            stock,
        } = item;

        const productId = _id;

        if (stock === 0) {
            return res.status(400).json({
                success: false,
                message: "Item out of stock",
            });
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = await Cart.create({
                user: userId,
                items: [
                    {
                        productId,
                        name,
                        originalPrice,
                        finalPrice,
                        image,
                        qty,
                        shop,
                        foodType,
                        rating,
                        discount,
                        stock,
                    },
                ],
            });

            return res.status(201).json({
                success: true,
                message: `${name} added to cart`,
                cart,
            });
        }

        const existingItem = cart.items.find(
            (i) => i.productId.toString() === productId.toString()
        );

        if (existingItem) {
            return res.status(409).json({
                success: false,
                message: "Item already in cart",
            });
        }

        cart.items.push({
            productId,
            name,
            originalPrice,
            finalPrice,
            image,
            qty,
            shop,
            foodType,
            rating,
            discount,
            stock,
        });

        await cart.save();

        return res.status(200).json({
            success: true,
            message: `${name} added to cart`,
            cart,
        });

    } catch (error) {
        console.error("AddItemToCart error:", error);
        return res.status(500).json({
            success: false,
            message: "Add to cart failed",
        });
    }
};


export const getCartItems = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(200).json({
                success: true,
                cart: { items: [] },
            });
        }

        return res.status(200).json({
            success: true,
            cart,
        });

    } catch (error) {
        console.error("getCartItems error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch cart",
        });
    }
};

export const updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { qty } = req.body;
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId });

        if (!cart)
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });

        const item = cart.items.find(
            (i) => i.productId.toString() === productId
        );

        if (!item)
            return res.status(404).json({
                success: false,
                message: "Item not found",
            });

        if (qty > item.stock)
            return res.status(400).json({
                success: false,
                message: `Only ${item.stock} available`,
            });

        item.qty = qty;
        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart,
        });

    } catch (error) {
        console.error("updateCartItem error:", error);
        return res.status(500).json({
            success: false,
            message: "Update failed",
        });
    }
};


export const delateCartItem = async (req, res) => {
    const { productId } = req.params || {}
    const userId = req.user._id || {}

    try {
        const cart = await Cart.findOne({ user: userId })
        if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

        cart.items = cart.items.filter(i => i.productId.toString() !== productId.toString())

        await cart.save()

        return res.status(200).json({ success: true, message: "Cart removed", cart })
    } catch (error) {
        console.log("delate cart items error", error);
        return res.status(400).json({ success: false, message: "delate cart items error", error })

    }
}


export const deleteCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId });

        if (!cart)
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });

        cart.items = cart.items.filter(
            (i) => i.productId.toString() !== productId
        );

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Item removed",
            cart,
        });

    } catch (error) {
        console.error("deleteCartItem error:", error);
        return res.status(500).json({
            success: false,
            message: "Delete failed",
        });
    }
};


export const clearCart = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOneAndUpdate(
            { user: userId },
            { $set: { items: [] } },
            { new: true }
        );

        if (!cart)
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });

        return res.status(200).json({
            success: true,
            message: "Cart cleared",
            cart,
        });

    } catch (error) {
        console.error("clearCart error:", error);
        return res.status(500).json({
            success: false,
            message: "Clear cart failed",
        });
    }
};
