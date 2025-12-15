import Cart from "../models/cart.Models.js";
import Item from "../models/items.Models.js";
import Shop from "../models/shop.Models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createItem = async (req, res) => {

    try {
        const userId = req.user._id;
        const { name, price, description, category, stock, foodType, discount } = req.body;

        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }

        let validDiscount = Number(discount) || 0;
        if (validDiscount < 0) validDiscount = 0;
        if (validDiscount > 100) validDiscount = 100;

        const shop = await Shop.findOne({ owner: userId }).populate("owner").populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })

        const item = await Item.create({
            name,
            image,
            price,
            description,
            shop: shop._id,
            category,
            stock,
            foodType,
            discount: validDiscount,
        });
        shop.items.push(item)
        await shop.save()

        return res
            .status(200)
            .json({ success: true, message: "Item Created Successfully", shop });
    } catch (error) {
        console.log("create item error", error);
        return res
            .status(400)
            .json({ success: false, message: "create item error", error });
    }
};


export const updateItem = async (req, res) => {
    try {
        const { name, price, description, category, stock, foodType, discount } = req.body;
        const itemId = req.params.itemId;
        const userId = req.user._id;

        // Check itemId
        if (!itemId) {
            return res.status(400).json({ success: false, message: "Item ID is required" });
        }

        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }


        let updateData = {
            name,
            price,
            description,
            category,
            stock,
            foodType,
            image,
        };

        // Add discount logic (validate range)
        if (discount !== undefined) {
            let validDiscount = Number(discount) || 0;
            if (validDiscount < 0) validDiscount = 0;
            if (validDiscount > 100) validDiscount = 100;
            updateData.discount = validDiscount;
        }

        const item = await Item.findByIdAndUpdate(itemId, updateData, {
            new: true,
            runValidators: true,
        });


        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        const shop = await Shop.findOne({ owner: userId }).populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })
        if (!shop) {
            return res.status(404).json({ success: false, message: "Shop not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Item Updated Successfully",
            shop,
        });

    } catch (error) {
        console.log("item update error", error);
        return res.status(400).json({
            success: false,
            message: "item update error",
            error,
        });
    }
};

export const deleteItem = async (req, res) => {

    try {
        const itemId = req.params.itemId
        const userId = req.user._id

        if (!itemId) {
            return res.status(400).json({ success: false, message: "itemId is required" })
        }
        const item = await Item.findByIdAndDelete(itemId)
        if (!item) {
            return res.status(400).json({ success: false, message: "Item not found" })
        }

        const shop = await Shop.findOne({ owner: userId }).populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })
        if (!shop) {
            return res.status(404).json({ success: false, message: "Shop not found" });
        }

        return res.status(200).json({ success: true, message: "Item Deleted Successfully", shop })

    } catch (error) {
        console.log("item delate error", error);
        return res.status(400).json({ success: false, message: "item delate error", error })
    }
}

export const getItemByShopId = async (req, res) => {
    try {
        const shopId = req.params.shopId
        if (!shopId) {
            return res.status(400).json({ success: false, message: "ShopId is required" })
        }
        const items = await Item.fi({ shop: shopId })

        if (!items || items.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No items found for this shop",
            });
        }
        return res.status(200).json({ success: true, message: "Item fetched Successfully", items })

    } catch (error) {
        console.log("get item error", error);
        return res.status(400).json({ success: false, message: "get item error", error })
    }
}

export const getAllItems = async (req, res) => {

    try {
        const items = await Item.find({})
        return res.status(200).json({ success: true, message: "All Items fetched Successfully", items })

    } catch (error) {
        console.log("get all items error", error);
        return res.status(400).json({ success: false, message: "get all items error", error })

    }
}


export const grtItemsByCity = async (req, res) => {
    const { city } = req.params || {}
    if (!city) {
        return res.status(400).json({ success: false, message: "City is required" })
    }
    try {
        const shop = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        }).populate("items")

        if (!shop) {
            return res.status(400).json({ success: false, message: "Shop not found" })
        }
        const shopId = shop.map(((shop) => shop._id))
        const items = await Item.find({
            shop: { $in: shopId }
        })
        return res.status(200).json({ success: true, message: "getItem By City  fetched Successfully", items })


    } catch (error) {
        console.log("getItemsByCity error", error);
        return res.status(400).json({ success: false, message: "getItemsByCity error", error })

    }
}


