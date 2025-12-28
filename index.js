import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/DB.js";
import AuthRouter from './routes/Auth.Route.js'
import UserRoute from './routes/User.Route.js'
import ShopRoute from './routes/shop.Route.js'
import ItemRoute from './routes/item.Route.js'
import CartRoute from './routes/cart.Route.js'
import CreateOrder from './routes/payment.Routes.js'
import OrderRoute from './routes/order.Route.js'


dotenv.config();
const app = express()
const port = process.env.PORT || 8000
console.log("ENV CHECK:", process.env.RAZORPAY_KEY_ID); // DEBUG
//middlewares
app.use(express.json())
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,              
}));
app.use(cookieParser())


//routes
app.use('/api/auth', AuthRouter)
app.use('/api/user', UserRoute)
app.use('/api/shop', ShopRoute)
app.use('/api/item', ItemRoute)
app.use('/api/cart', CartRoute)
app.use("/api/payment", CreateOrder)
app.use("/api/order", OrderRoute)



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectDB()
})