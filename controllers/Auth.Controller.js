import User from "../models/User.Models.js";
import bcrypt from 'bcrypt';
import { setToken } from "../utils/setToken.js";


export const SignUp = async (req, res) => {

    try {
        const { fullName, email, password, mobileNumber, role } = req.body;
        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: "User already exists", success: false })
        }

        const hashpasword = bcrypt.hashSync(password, 10)
        if (!hashpasword) {
            return res.status(500).json({ message: "Password hashing failed", success: false })
        }

        const newUser = await User.create({
            fullName,
            email,
            password: hashpasword,
            mobileNumber,
            role
        })
        if (!newUser) {
            return res.status(500).json({ message: "User creation failed", success: false })
        }
        setToken(newUser, res, 201, "User created successfully")


    } catch (error) {
        console.log("signup error" + error);
        res.status(500).json({ message: "Server Error" })
    }

}



export const Signin = async (req, res) => {
    try {
        const { email, password, role } = req.body || {}
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User not found", success: false })
        }

        const isPassword = bcrypt.compare(password, user.password)

        if (!isPassword) {
            return res.status(400).json({ message: "Invalid credentials", success: false })
        }

        if (user.role !== role) {
            return res.status(400).json({ message: "Role mismatch", success: false })
        }

        setToken(user, res, 200, "Signin successful")

    } catch (error) {
        console.log("signin error" + error);
        res.status(500).json({ message: "Server Error" })

    }
}

export const Signout = (req, res) => {
    try {


        res.clearCookie('token')
        return res.status(200).json({ success: true, message: "Signout successful" })
    } catch (error) {
        console.log("signout error" + error);
        return res.status(500).json({ message: "Server Error" })

    }
}