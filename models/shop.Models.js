import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */

    name: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String, // cloudinary / s3 url
      required: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    /* ================= OWNER ================= */

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* ================= CATEGORY ================= */

    category: {
      type: String,
      enum: [
        "restaurant",
        "grocery",
        "bakery",
        "sweet",
        "kirana",
        "pharmacy",
        "other",
      ],
      default: "restaurant",
    },

    /* ================= TIMING ================= */

    openingTime: {
      type: String, // "09:00 AM"
      default: "09:00 AM",
    },

    closingTime: {
      type: String, // "10:00 PM"
      default: "10:00 PM",
    },

    isOpenNow: {
      type: Boolean,
      default: true, // manually controlled (open/close button)
    },

    /* ================= ADDRESS ================= */

    address: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    pinCode: {
      type: String,
      required: true,
    },

    /* ================= ITEMS ================= */

    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
      },
    ],

    /* ================= ADMIN FLOW ================= */

    // status: {
    //   type: String,
    //   enum: ["pending", "approved", "rejected"],
    //   default: "pending",
    // },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Shop = mongoose.model("Shop", shopSchema);
export default Shop;
