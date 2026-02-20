import mongoose from "mongoose";

/* ================= CART ITEM SUB-SCHEMA ================= */
const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    finalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    foodType: {
      type: String,
      enum: ["Veg", "Non-Veg"],
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    qty: {
      type: Number,
      default: 1,
      min: 1,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    stock: {
      type: Number,
      default: 1,
      min: 0,
    },

    subtotal: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

/* ================= MAIN CART SCHEMA ================= */
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one cart per user
      index: true,
    },

    items: [cartItemSchema],

    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/* ================= PRE-SAVE HOOK ================= */
cartSchema.pre("save", function (next) {
  let total = 0;

  this.items.forEach((item) => {
    item.subtotal = item.finalPrice * item.qty;
    total += item.subtotal;
  });

  this.totalAmount = total;

  next();
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
