import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
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
    }

})

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,

    },
    password: {
        type: String,

    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
    },
    otpExpiry: {
        type: Date,
    },

    role: {
        type: String,
        enum: ['user', 'admin', 'owner', 'delivery'],
        default: 'user'
    },
    address: [addressSchema]



}, { timestamps: true })

const User = mongoose.model('User', userSchema)
export default User;