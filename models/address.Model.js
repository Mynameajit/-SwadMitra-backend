import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pinCode: {
        type: String,
        required: true
    },
    buildingName: {
        type: String,
    },
    landmark: {
        type: String,
    },

    isLocation: {
        type: String,
        required: true
    },
    isDefault: {
        type: Boolean,
        default: false,
    },

}, { timestamps: true })


const Address = mongoose.model("Address", addressSchema)
export default Address