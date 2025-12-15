import mongoose from "mongoose"

const shopOrderItemsSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item"
    },
    price: {
        type: Number,

    },


}, { timestamps: true })

const shopOrderSchema = new mongoose.Schema({
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    subTotal: {
        type: Number,

    },
    shopOrderItems: [shopOrderItemsSchema]

}, { timestamps: true })

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["cod", "online"],
        default: "cod"
    },
    deliveryAddress: {
        type: Object,
        required: true
    },
    totalAmount: { type: Number },
    shopOrder: [shopOrderSchema]


}, { timestamps: true })
    

const Order = mongoose.model("Order", OrderSchema)
export default Order