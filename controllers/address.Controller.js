import Address from "../models/address.Model.js"
import User from "../models/User.Models.js"



export const getAddress = async (req, res) => {
    const userId = req.user._id

    try {
        const address = await Address.find({ user: userId })
        if (address.length === 0) {
            return res.status(400).json({
                message: "Address Not Found",
                success: false,
                address: [],
            })
        }
        return res.status(200).json({
            success: true,
            message: "Address fetched successfully",
            address
        });

    } catch (error) {
        console.log("get address error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

export const addAddress = async (req, res) => {
    const userId = req.user._id
    const { name, mobile, city, state, pinCode, buildingName, landmark, isLocation, } = req.body || {}

    if (!name || !mobile || !city || !state || !pinCode || !isLocation) {
        return res.status(400).json({
            message: "All required fields are mandatory",
            success: false,
        });
    }

    try {
        const addressData = {
            user: userId,
            name,
            mobile,
            city,
            state,
            pinCode,
            buildingName,
            landmark,
            isLocation,
        }

        const existingAddresses = await Address.find({ user: userId })
        if (existingAddresses.length === 0) {
            addressData.isDefault = true
        }

        const address = await Address.create(addressData)
        return res.status(200).json({ message: "Address added successfully", success: true, address })

    } catch (error) {
        console.log("add address error:", error);
        return res.status(500).json({ message: "Server error", success: false })
    }
}


export const updateAddress = async (req, res) => {

    const userId = req.user._id
    const addressData = req.body
    const addressId = req.params.addressId

    try {
        const address = await Address.findOne({
            _id: addressId,
            user: userId
        })
        if (!address) {
            return res.status(404).json({ success: false, message: "Address not  found" })
        }
        const updatedAddress = await Address.findByIdAndUpdate(
            addressId,
            addressData,
            { new: true, runValidators: true }
        )

        return res.status(200).json({
            success: true,
            message: "Address updated successfully",
            address,
        });

    } catch (error) {
        console.log("update address error:", error);
        return res.status(500).json({ message: "Server error", success: false })
    }
}

export const updateDefaultAddress = async (req, res) => {

    const userId = req.user._id
    const addressId = req.params.addressId

    try {
        const address = await Address.findOne({
            _id: addressId,
            user: userId
        })
        if (!address) {
            return res.status(404).json({ success: false, message: "Address not  found" })
        }

        await Address.updateMany(
            { user: userId },
            { $set: { isDefault: false } }
        )
        address.isDefault = true
        await address.save()

        return res.status(200).json({
            success: true,
            message: "Default address updated successfully",
            address,
        });
    } catch (error) {
        console.log("update Default address error:", error);
        return res.status(500).json({ message: "Server error", success: false })
    }
}


export const delateAddress = async (req, res) => {

    const userId = req.user._id
    const addressId = req.params.addressId

    try {
        const address = await Address.findOne({
            _id: addressId,
            user: userId
        })
        if (!address) {
            return res.status(404).json({ success: false, message: "Address not  found" })
        }
        const wasDefault = address.isDefault

        await Address.findByIdAndDelete(addressId);

        if (wasDefault) {
            const nextAddress = await Address.findOne({ user: userId })
            if (nextAddress) {
                nextAddress.isDefault = true
                await nextAddress.save()
            }
        }

        return res.status(200).json({
            success: true,
            message: "Address deleted successfully",
        });

    } catch (error) {
        console.log("Delate address error:", error);
        return res.status(500).json({ message: "Server error", success: false })
    }
}