import razorpay from "../config/razorpay.js"
import crypto from "crypto"; 

export const createOrder = async (req, res) => {
    
    try {
        const { amount } = req.body || {}
        console.log(amount);

        const option = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        }
        const order = await razorpay.orders.create(option)

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



export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        const body =
            razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            return res.status(200).json({
                success: true,
                message: "Payment verified successfully",
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid signature",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false });
    }
};
