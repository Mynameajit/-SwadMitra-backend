import jwt from 'jsonwebtoken';

export const setToken = async (user, res, statusCode, message, cookieName = "token") => {

    try {

        const token = await jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE
        })

        res.cookie(cookieName, token, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(statusCode).json({
            success: true,
            message,
            token,
            user
        })


    } catch (error) {
        console.log(error);
        return res.status(400).json({ success: false, message: "Token error " })


    }
}