import mongoose from "mongoose";

const itemsSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        image: {
            type: String,
            required: true,
        },

        originalPrice: {
            type: Number,
            required: true,
            min: 1,
        },

        description: {
            type: String,
            trim: true,
        },

        shop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shop",
            required: true,
            index: true,
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
                "Burgers",
            ],
            index: true,
        },

        stock: {
            type: Number,
            default: 1,
            min: 0,
        },

        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
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

        finalPrice: {
            type: Number,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// 🔥 Auto calculate final price
itemsSchema.pre("save", function (next) {
    const discountAmount =
        (this.originalPrice * this.discount) / 100;
    this.finalPrice = Math.round(
        this.originalPrice - discountAmount
    );
    next();
});

const Item = mongoose.model("Item", itemsSchema);
export default Item;
