import Item from "../models/items.Models.js";
import Shop from "../models/shop.Models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";



// ===========================  create Item ======================
export const createItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            name,
            originalPrice,
            description,
            category,
            stock,
            foodType,
            discount,
        } = req.body;

        if (!name || !originalPrice || !category || !foodType) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing",
            });
        }

        const shop = await Shop.findOne({ owner: userId });
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: "Shop not found",
            });
        }

        let imageUrl;
        if (req.file) {
            const uploaded = await uploadOnCloudinary(req.file.path);
            imageUrl = uploaded?.secure_url || uploaded;
        }

        const item = await Item.create({
            name,
            image: imageUrl,
            originalPrice,
            description,
            shop: shop._id,
            category,
            stock,
            foodType,
            discount,
        });

        shop.items.push(item._id);
        await shop.save();

        const updatedShop = await Shop.findById(shop._id).populate({
            path: "items",
            match: { isActive: true },
            options: { sort: { createdAt: -1 } },
        });

        return res.status(201).json({
            success: true,
            message: "Item created successfully",
            items: updatedShop.items,
        });
    } catch (error) {
        console.log("create item error", error);
        return res.status(500).json({
            success: false,
            message: "Create item failed",
        });
    }
};



// ===========================  update Item ======================

export const updateItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user._id;

    const shop = await Shop.findOne({ owner: userId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const item = await Item.findOne({
      _id: itemId,
      shop: shop._id,
      isActive: true,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    let imageUrl = item.image;

    if (req.file) {
      const uploaded = await uploadOnCloudinary(req.file.path);
      imageUrl = uploaded?.secure_url || uploaded;
    }

    Object.assign(item, {
      ...req.body,
      image: imageUrl,
    });

    await item.save(); // 🔥 updatedAt auto update

    return res.status(200).json({
      success: true,
      message: "Item updated successfully",
      item, // 🔥 only updated item send
    });
  } catch (error) {
    console.log("update item error", error);
    return res.status(500).json({
      success: false,
      message: "Update item failed",
    });
  }
};





// ===========================  Delete Item ======================

export const deleteItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const userId = req.user._id;

        const shop = await Shop.findOne({ owner: userId });
        if (!shop) {
            return res.status(404).json({ success: false, message: "Shop not found" });
        }

        const item = await Item.findOneAndUpdate(
            { _id: itemId, shop: shop._id },
            { isActive: false },
            { new: true }
        );

        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        const updatedShop = await Shop.findById(shop._id).populate({
            path: "items",
            match: { isActive: true },
        });

        return res.status(200).json({
            success: true,
            message: "Item disabled successfully",
            items: updatedShop.items,
        });
    } catch (error) {
        console.log("delete item error", error);
        return res.status(500).json({
            success: false,
            message: "Delete item failed",
        });
    }
};



// ===========================  get Item  by shopId ======================
export const getItemByShopId = async (req, res) => {
    try {
        const { shopId } = req.params;

        const items = await Item.find({
            shop: shopId,
            isActive: true,
        }).sort({ createdAt: -1 });

        if (!items.length) {
            return res.status(404).json({
                success: false,
                message: "No items found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Items fetched successfully",
            items,
        });
    } catch (error) {
        console.log("get item error", error);
        return res.status(500).json({
            success: false,
            message: "Get items failed",
        });
    }
};


// ===========================  get my items   ======================

export const getMyItems = async (req, res) => {
    try {
        const userId = req.user._id;

        const shop = await Shop.findOne({ owner: userId });
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: "Shop not found",
            });
        }

        const items = await Item.find({
            shop: shop._id,
            isActive: true,
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            items,
        });
    } catch (error) {
        console.log("getMyItems error", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch owner items",
        });
    }
};




// ===========================  get all     Item   ======================
export const getAllItems = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const totalItems = await Item.countDocuments({ isActive: true });

        const items = await Item.find({ isActive: true })
            .populate("shop", "name city")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            items,
            currentPage: page,
            totalPage: Math.ceil(totalItems / limit),
            totalItems,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Get all items failed",
        });
    }
};



export const getItemsByCity = async (req, res) => {
    try {
        const { city } = req.params;

        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") },
        });

        const shopIds = shops.map((s) => s._id);

        const items = await Item.find({
            shop: { $in: shopIds },
            isActive: true,
        });

        return res.status(200).json({
            success: true,
            items,
        });
    } catch (error) {
        console.log("getItemsByCity error", error);
        return res.status(500).json({
            success: false,
            message: "Get items by city failed",
        });
    }
};
