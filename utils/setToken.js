import jwt from 'jsonwebtoken';

export const setToken = (user, res, statusCode, message) => {

    try {

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE
        })

        // localhost पर काम करने वाला config
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
            path: "/",
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });

        res.status(statusCode).json({
            success: true,
            message,
            token
        })


    } catch (error) {
        console.log(error);
        return res.status(400).json({ success: false, message: "Token error " })


    }
}