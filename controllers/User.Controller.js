import User from "../models/User.Models.js";



export const getUser = async (req, res) => {

    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select("-password -__v");
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false })
        }
        return res.status(200).json({ message: "User profile fetched successfully", success: true, user })
    } catch (error) {
        console.log("get profile error:", error);
        return res.status(500).json({ message: "Server error", success: false })
    }

}

export const addAddress = async (req, res) => {
    const userId = req.user._id || {}
    const addressData = req.body || {}

    try {
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, message: "User not  found" })
        }
        user.address.push(addressData)

        await user.save()
        return res.status(200).json({ message: "Add Address Details ", success: true, user })

    } catch (error) {
        console.log("add address error:", error);
        return res.status(500).json({ message: "Server error", success: false })
    }
}


export const updateAddress = async (req, res) => {

    const userId = req.user._id || {}
    const addressData = req.body || {}
    const addressId = req.params.addressId || {}

    try {
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, message: "User not  found" })
        }

        const updateAddress = user.address.find((ads) => ads._id.toString() === addressId.toString())
        if (!updateAddress) {
            return res.status(404).json({ success: false, message: "Address not  found" })
        }
        updateAddress.set(addressData)

        await user.save()
        return res.status(200).json({ message: "Update Address  ", success: true, user })

    } catch (error) {
        console.log("add address error:", error);
        return res.status(500).json({ message: "Server error", success: false })
    }
}


export const delateAddress = async (req, res) => {

    const userId = req.user._id || {}
    const addressId = req.params.addressId || {}

    try {
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, message: "User not  found" })
        }

        const originalLength = user.address.length

        user.address = user.address.filter((ads) => ads._id.toString() !== addressId.toString())
        if (!delateAddress) {
            return res.status(404).json({ success: false, message: "Address not  found" })
        }

        if (user.address.length === originalLength) {
            return res.status(404).json({
                success: false,
                message: "Address not found"
            })
        }
        await user.save()
        return res.status(200).json({ message: "Delate Address  ", success: true, user })

    } catch (error) {
        console.log("add address error:", error);
        return res.status(500).json({ message: "Server error", success: false })
    }
}