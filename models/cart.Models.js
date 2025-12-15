import mongoose from "mongoose"


const cartItemsSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Item",
                required: true
            },
            shop: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Shop",
                required: true
            },
            name: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            foodType: {
                type: String,
                enum: ["Veg", "Non-Veg"],
                required: true,
            },
            image: {
                type: String,
                required: true
            },
            qty: {
                type: Number,
                default: 1,
                min: 1
            },
            rating: {
                type: Number,
                default: 0,
            },
            discount: {
                type: Number,
                default: 0,
                min: 0,
                max: 100,
            },
             stock: {
        type: Number,
        default: 1,
        min: 0,
    },
        }
    ]

}, { timestamps: true })


const Cart = mongoose.model("Cart", cartItemsSchema)
export default Cart
