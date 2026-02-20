import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/DB.js";

import AuthRouter from "./routes/Auth.Route.js";
import ShopRoute from "./routes/shop.Route.js";
import ItemRoute from "./routes/item.Route.js";
import CartRoute from "./routes/cart.Route.js";
import PaymentRoute from "./routes/payment.Routes.js";
import OrderRoute from "./routes/order.Route.js";
import AddressRoute from "./routes/address.Route.js";
import dashboardAuth from "./routes/dashboard.Auth.Route.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 8000;

// Middlewares
app.use(express.json());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());

// Routes
app.use("/api/auth", AuthRouter);
app.use("/api/shop", ShopRoute);
app.use("/api/item", ItemRoute);
app.use("/api/cart", CartRoute);
app.use("/api/payment", PaymentRoute);
app.use("/api/order", OrderRoute);
app.use("/api/address", AddressRoute);

// ================ Dashboard =======================
app.use("/api/dashboard/auth", dashboardAuth);


// Server Start
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ DB connection failed", error);
  }
};

startServer();
