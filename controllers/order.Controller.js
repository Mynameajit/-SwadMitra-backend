import Item from "../models/items.Models.js";
import Order from "../models/OrderModel.js";
import Shop from "../models/shop.Models.js";
import User from "../models/User.Models.js";

/* =====================================================
   PLACE ORDER
===================================================== */

export const placeOrder = async (req, res) => {
  try {
    const { paymentMethod, deliveryAddress, cartItems } = req.body;
    const user = req.user;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    const groupItemsByShop = {};

    // 🔹 GROUP ITEMS BY SHOP
    for (const item of cartItems) {
      if (!groupItemsByShop[item.shop]) {
        groupItemsByShop[item.shop] = [];
      }
      groupItemsByShop[item.shop].push(item);
    }

    let itemsTotal = 0;
    let totalQty = 0;

    const shopOrders = [];

    // 🔥 Using for-of instead of Promise.all (safer)
    for (const shopId of Object.keys(groupItemsByShop)) {
      const shop = await Shop.findById(shopId).populate("owner");
      if (!shop) {
        return res.status(404).json({
          success: false,
          message: "Shop not found",
        });
      }

      let subTotal = 0;
      const shopOrderItems = [];

      for (const cartItem of groupItemsByShop[shopId]) {
        const dbItem = await Item.findById(cartItem.productId);
        if (!dbItem) {
          return res.status(404).json({
            success: false,
            message: "Item not found",
          });
        }

        const price = Number(dbItem.finalPrice || dbItem.price);
        const qty = Number(cartItem.qty);

        if (dbItem.stock < qty) {
          return res.status(400).json({
            success: false,
            message: `${dbItem.name} is out of stock`,
          });
        }

        const total = price * qty;

        dbItem.stock -= qty;
        await dbItem.save();

        subTotal += total;
        totalQty += qty;

        shopOrderItems.push({
          item: dbItem._id,
          name: dbItem.name,
          image: dbItem.image,
          price,
          qty,
          total,
        });
      }

      itemsTotal += subTotal;

      shopOrders.push({
        shop: shop._id,
        owner: shop.owner._id,
        subTotal,
        status: "Pending",
        shopOrderItems,
      });
    }

    // =============================
    // 🔥 DISCOUNT LOGIC
    // =============================

    let discount = 0;

    // Example rule:
    // If totalQty >= 5 → 10% discount
    if (totalQty >= 5) {
      discount = Math.round(itemsTotal * 0.1);
    }

    const discountedAmount = itemsTotal - discount;

    // =============================
    // 🔥 EXTRA CHARGES (ADD AFTER DISCOUNT)
    // =============================

    const deliveryCharge = discountedAmount > 599 ? 0 : 30;
    const platformFee = 20;

    const totalAmount =
      discountedAmount + deliveryCharge + platformFee;

    // =============================
    // 🔥 CREATE ORDER
    // =============================

    const newOrder = await Order.create({
      user: user._id,
      paymentMethod,
      paymentStatus:
        paymentMethod === "ONLINE" ? "Paid" : "Pending",
      deliveryAddress,

      itemsTotal,
      totalQty,
      discount,
      deliveryCharge,
      platformFee,
      totalAmount,

      shopOrders,
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Place Order Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};


/* =====================================================
   USER CANCEL ORDER (Full Order Cancel)
===================================================== */

export const cancelShopOrderByUser = async (req, res) => {
  try {
    const { orderId, shopOrderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!shopOrder) {
      return res.status(404).json({ success: false, message: "Shop order not found" });
    }

    /* 🔒 USER LOCK RULE */
    if (!["Pending", "Accepted"].includes(shopOrder.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel after preparing started",
      });
    }

    shopOrder.status = "Cancelled";
    await order.save()


    res.status(200).json({
      success: true,
      message: "Item cancelled successfully",
      orderId: order._id,
      updatedItem: shopOrder,
    });

  } catch (error) {
    console.log("Cancel error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



/* =====================================================
   UPDATE SHOP ORDER STATUS (OWNER)
===================================================== */
// controllers/orderController.js


export const updateShopOrderStatus = async (req, res) => {
  try {
    const { orderId, shopOrderId } = req.params;
    const { status } = req.body;

    const allowedStatus = [
      "Pending",
      "Accepted",
      "Preparing",
      "Out For Delivery",
      "Delivered",
      "Cancelled",
    ];

    /*  Validate Status */
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    /* 2Find Order */
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /*  Find Shop Order */
    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!shopOrder) {
      return res.status(404).json({
        success: false,
        message: "Shop order not found",
      });
    }

    /* Owner Authorization */
    if (shopOrder.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    /* Lock After Final Stage */
    if (["Delivered", "Cancelled"].includes(shopOrder.status)) {
      return res.status(400).json({
        success: false,
        message: "Status cannot be changed after final stage",
      });
    }

    /* 6️ Update Shop Order Status */
    shopOrder.status = status;


    /*  Save */
    await order.save();

    /*  Clean Response for Redux */
    const responseData = {
      orderId: order._id,
      shopOrderId: shopOrder._id,
      status: shopOrder.status,
    };

    return res.status(200).json({
      success: true,
      message: "Shop order status updated",
      updatedOrders: responseData,
    });

  } catch (error) {
    console.error("Update Shop Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



/* =====================================================
   GET USER ORDERS
===================================================== */
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("shopOrders.shop", "name mobile city")
      .populate(
        "shopOrders.shopOrderItems.item",
        "name price image discount rating"
      );

    return res.status(200).json({
      success: true,
      message: "User orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.log("getUserOrders error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


/* =====================================================
   GET OWNER ORDERS
===================================================== */
export const getOwnerOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      "shopOrders.owner": req.user._id,
    })
      .sort({ createdAt: -1 })
      .populate("user", "fullName email mobile")
      .populate(
        "shopOrders.shopOrderItems.item",
        "name price image discount rating"
      )
      .populate("shopOrders.shop", "name mobile address");

    /* 🔥 Only return owner’s shop orders */
    const filteredOrders = orders.map((order) => {
      const myShopOrders = order.shopOrders.filter(
        (so) => so.owner.toString() === req.user._id.toString()
      );

      return {
        _id: order._id,
        user: order.user,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        deliveryAddress: order.deliveryAddress,
        totalAmount: order.totalAmount,
        overallStatus: order.overallStatus,
        createdAt: order.createdAt,
        shopOrders: myShopOrders,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Owner orders fetched successfully",
      orders: filteredOrders,
    });
  } catch (error) {
    console.log("getOwnerOrders error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

