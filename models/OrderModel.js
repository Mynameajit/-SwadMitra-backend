import mongoose from "mongoose"

const shopOrderItemsSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true
    },
    price: {
        type: Number,

    },
    qty: { type: Number },
    name: { type: String }


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
    shopOrderItems: [shopOrderItemsSchema],
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Preparing", "Out Of Delivery", "Delivered", "Cancelled"],
        default: "Pending"
    }

}, { timestamps: true })

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["COD", "ONLINE"],
        default: "COD"
    },
    deliveryAddress: {
        type: Object,
        required: true
    },
    totalAmount: { type: Number },
    shopOrders: [shopOrderSchema]


}, { timestamps: true })


const Order = mongoose.model("Order", OrderSchema)
export default Order