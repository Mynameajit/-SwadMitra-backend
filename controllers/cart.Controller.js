import Cart from "../models/cart.Models.js"

export const AddItemToCart = async (req, res) => {

    const userId = req.user._id
    const { name, price, image, qty, shop, productId, foodType, rating, discount, stock } = req.body || {}
    try {
        const cart = await Cart.findOne({ user: userId })

        if (!cart) {
            const cart = await Cart.create({
                user: userId,
                items: [
                    {
                        name,
                        price,
                        image,
                        qty,
                        shop,
                        productId,
                        foodType,
                        rating,
                        discount,
                        stock
                    }
                ]
            })
            return res.status(200).json({ success: true, message: `${name} Add to Cart`, cart })

        }

        const isExists = cart.items.some(i => i.productId.toString() === productId.toString());

        if (isExists) {
            return res.status(200).json({ success: false, message: "This product already add to cat" })
        }
        cart.items.push({
            name,
            price,
            image,
            qty,
            shop,
            productId,
            foodType,
            rating,
            discount,
            stock
        })
        await cart.save()
        return res.status(200).json({ success: true, message: `${name} Add to Cart`, cart })

    } catch (error) {
        console.log("AddItemToCart error", error);
        return res.status(400).json({ success: false, message: "AddItemToCart error", error })

    }

}


export const getCartItems = async (req, res) => {
    const userId = req.user?._id
    try {
        const cart = await Cart.find({ user: userId }).populate("user")
        return res.status(200).json({ success: true, message: `get all cat items`, cart })

    } catch (error) {
        console.log("get cart items error", error);
        return res.status(400).json({ success: false, message: "get cart items error", error })
    }

}

export const updateCartItem = async (req, res) => {
    const { qty } = req.body || {}
    const { productId } = req.params || {}
    const userId = req.user._id || {}

    try {
        const cart = await Cart.findOne({ user: userId })
        if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

        const index = cart.items.findIndex(i => i.productId.toString() === productId.toString())

        if (index === -1) {
            return res.status(404).json({ success: false, message: "Item not found in cart" })
        }
        cart.items[index].qty = qty
        await cart.save()

        return res.status(200).json({ success: true, message: "Cart updated", cart })
    } catch (error) {
        console.log("update cart items error", error);
        return res.status(400).json({ success: false, message: "update cart items error", error })

    }
}


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


export const ClearAllCartItems = async (req, res) => {
    const userId = req.user._id || {}

    try {

        const cart = await Cart.findOneAndUpdate(
            { user: userId },
            { $set: { items: [] } },
            { new: true }
        );
        if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });


        return res.status(200).json({ success: true, message: "Cart Clear", cart })
    } catch (error) {
        console.log("delate cart items error", error);
        return res.status(400).json({ success: false, message: "Clear cart items error", error })

    }
}

