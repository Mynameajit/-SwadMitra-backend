import mongoose from "mongoose";

const itemsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
    },

    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            "Snacks",
            "Sandwich",
            "Desserts",
            "Drinks",
            "Fast Food",
            "Cake",
            "Pasta",
            "Noodles",
            "Pizza",
            "Burgers"
        ],
    },

    stock: {
        type: Number,
        default: 1,
        min: 0,
    },
    rating: {
        type: Number,
        default: 0,
    },
    foodType: {
        type: String,
        enum: ["Veg", "Non-Veg"],
        required: true,
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
}, { timestamps: true })

const Item = mongoose.model("Item", itemsSchema)
export default Item