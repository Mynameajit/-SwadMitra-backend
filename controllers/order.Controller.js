import Order from "../models/OrderModel.js"
import Shop from "../models/shop.Models.js"
import User from "../models/User.Models.js"

export const placeOrder = async (req, res) => {
    try {
        const { paymentMethod, deliveryAddress, totalAmount, cartItems } = req.body || {}
        const user = req.user || {}
        const groupItemsByShop = {}

        cartItems.forEach((item) => {
            const shopId = item.shop;

            if (!groupItemsByShop[shopId]) {
                groupItemsByShop[shopId] = [];
            }
            groupItemsByShop[shopId].push(item)

        })

        const shopOrders = await Promise.all(Object.keys(groupItemsByShop).map(async (shopId) => {

            const shop = await Shop.findById(shopId).populate("owner")
            if (!shop) {
                return res.status(400).json({ message: "Shop not found", success: false })

            }
            const items = groupItemsByShop[shopId]

            const subTotal = items.reduce((sum, item) => {
                const price = Number(item.price);
                const qty = Number(item.qty);
                const discount = Number(item.discount || 0);

                const itemTotal = price * qty;
                const discountAmount = discount
                    ? Math.ceil((itemTotal * discount) / 100)
                    : 0;

                return Number(sum) + (Number(itemTotal - discountAmount));

            }, 0);


            return {
                shop: shop._id,
                owner: shop.owner._id,
                subTotal,
                shopOrderItems: items.map((item) => {
                    const totalPrice = Number(item.price || 0) * Number(item.qty || 0);
                    const discountPrice = totalPrice - Math.ceil((totalPrice * (Number(item.discount || 0))) / 100);

                    return {
                        item: item.productId,
                        price: discountPrice,
                        qty: item.qty,
                        name: item.name
                    }
                })
            }
        }))

        const newOrder = await Order.create({
            user: user._id,
            paymentMethod,
            deliveryAddress,
            totalAmount,
            shopOrders
        })



        res.status(200).json({ message: "Order created successfully", success: true, order: newOrder })

    } catch (error) {
        console.log("order create error", error)
        return res.status(501).json({ message: "Server error", success: false })

    }
}

export const getMyOrders = async (req, res) => {

    try {
        const user = await User.findById(req.user._id)

        if (user.role === "user") {
            const userOrder = await Order.find({ user: user._id })
                .sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name mobile address ")
                .populate("shopOrders.owner", " email ")
                .populate("shopOrders.shopOrderItems.item", " name price image discount rating  ")


            return res.status(200).json({ message: "User orders fetched successfully", success: true, orders: userOrder })
        }
        else if (user.role === "owner") {
            const ownerOrder = await Order.find({ "shopOrders.owner": user._id })
                .sort({ createdAt: -1 })
                .populate("user", "fullName email _id role isVerified")
                .populate("shopOrders.shopOrderItems.item", " name price image discount rating  ")
                .populate("shopOrders.shop", "name mobile  ")

            const filteredOrders = ownerOrder.map(order => {
                const myShopOrders = order.shopOrders.filter(
                    so => so.owner.toString() === user._id.toString()
                );

                return {
                    _id: order._id,
                    user: order.user,
                    paymentMethod: order.paymentMethod,
                    deliveryAddress: order.deliveryAddress,
                    totalAmount: order.totalAmount,
                    createdAt: order.createdAt,
                    shopOrders: myShopOrders
                };
            });


            return res.status(200).json({ message: "Owner orders fetched successfully", success: true, orders: filteredOrders })
        }

    } catch (error) {
        console.log("Error fetching user orders:", error)
        return res.status(501).json({ message: "Server error", success: false })
    }
}