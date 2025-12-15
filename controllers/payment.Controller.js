import razorpay from "../config/razorpay.js"

export const createOrder = async (req, res) => {

    try {
        const { amount } = req.body || {}

        const option = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        }
        const order = razorpay.orders.create(option)

        res.status(200).json({
            success: true,
            order,
        });

    } catch (error) {
        console.log(" order Create in the razorpay error ");

        res.status(500).json({
            success: false,
            message: "Order creation failed",
        });
    }
}