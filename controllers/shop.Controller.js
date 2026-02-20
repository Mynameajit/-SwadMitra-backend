import Shop from "../models/shop.Models.js";
import User from "../models/User.Models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

/**
 * =================================================
 * CREATE SHOP (OWNER)
 * =================================================
 * Flow:
 * - Owner must be authenticated
 * - Image is mandatory
 * - Shop status = pending
 * - User.status: incomplete → pending
 */
export const createShop = async (req, res) => {
  try {
    const {
      name,
      city,
      state,
      address,
      pinCode,
      mobile,
      category,
      openingTime,
      closingTime,
    } = req.body;

    /* ========= VALIDATION ========= */
    if (
      !name ||
      !city ||
      !state ||
      !address ||
      !pinCode ||
      !mobile ||
      !openingTime ||
      !closingTime
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields including timing are required",
      });
    }

    if (openingTime >= closingTime) {
      return res.status(400).json({
        success: false,
        message: "Closing time must be later than opening time",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Shop image is required",
      });
    }

    /* ========= EXISTING SHOP CHECK ========= */
    const existingShop = await Shop.findOne({ owner: req.user._id });
    if (existingShop) {
      return res.status(409).json({
        success: false,
        message: "Shop already exists for this owner",
      });
    }

    /* ========= IMAGE UPLOAD ========= */
    const image = await uploadOnCloudinary(req.file.path);

    /* ========= CREATE SHOP ========= */
    const shop = await Shop.create({
      name,
      city,
      state,
      address,
      pinCode,
      mobile,
      image,
      category,
      owner: req.user._id,
      openingTime,
      closingTime,
      isOpenNow: true,
    });

    await shop.populate("owner", "-password");
    const user = await User.findById(req.user._id)
    user.status = "pending"
    user.save()

    return res.status(201).json({
      success: true,
      message: "Shop submitted successfully. Waiting for admin approval.",
      shop,
    });
  } catch (error) {
    console.error("Create shop error:", error);
    return res.status(500).json({
      success: false,
      message: "Create shop error",
    });
  }
};


/**
 * =================================================
 * UPDATE SHOP (OWNER)
 * =================================================
 * Rules:
 * - Only owner can update
 * - Image optional
 * - If shop approved → still allowed (content update)
 */
export const updateShop = async (req, res) => {
  try {
    const { shopId } = req.params;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    /* ========= OWNER CHECK ========= */
    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    /* ========= OPTIONAL IMAGE ========= */
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    const updatedData = {
      ...req.body,
      ...(image && { image }),
    };

    // Prevent wrong field overwrite
    delete updatedData._id;
    delete updatedData.owner;

    if (
      updatedData.openingTime &&
      updatedData.closingTime &&
      updatedData.openingTime >= updatedData.closingTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Closing time must be later than opening time",
      });
    }

    const updatedShop = await Shop.findByIdAndUpdate(
      shopId,
      updatedData,
      { new: true }
    ).populate("owner", "-password");

    return res.status(200).json({
      success: true,
      message: "Shop updated successfully",
      shop: updatedShop,
    });
  } catch (error) {
    console.error("Update shop error:", error);
    return res.status(500).json({
      success: false,
      message: "Shop update error",
    });
  }
};


/**
 * =================================================
 * DELETE SHOP (ADMIN / OWNER)
 * =================================================
 * Note:
 * - Usually hard delete avoid karte hain
 * - isActive=false better hota hai (soft delete)
 */
export const deleteShop = async (req, res) => {
  try {
    const { shopId } = req.params;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "shopId is required",
      });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    await Shop.findByIdAndDelete(shopId);

    return res.status(200).json({
      success: true,
      message: "Shop deleted successfully",
    });

  } catch (error) {
    console.error("Delete shop error:", error);
    return res.status(500).json({
      success: false,
      message: "Delete shop error",
    });
  }
};

/**
 * =================================================
 * GET LOGGED-IN OWNER SHOP
 * =================================================
 * Used for:
 * - Owner dashboard
 * - Edit shop
 */
export const getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id })
      .populate("owner", "-password")

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Shop fetched successfully",
      shop,
    });

  } catch (error) {
    console.error("Get my shop error:", error);
    return res.status(500).json({
      success: false,
      message: "Get my shop error",
    });
  }
};

/**
 * =================================================
 * GET SHOPS BY CITY (CUSTOMER)
 * =================================================
 * Rules:
 * - Only approved + active shops
 */
export const getShopByCity = async (req, res) => {
  try {
    const { city } = req.params;

    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
      status: "approved",
      isActive: true,
      isOpenNow: true,
    }).populate("items");

    return res.status(200).json({
      success: true,
      message: "Shops fetched successfully",
      shops,
    });
  } catch (error) {
    console.error("Get shop by city error:", error);
    return res.status(500).json({
      success: false,
      message: "Get shop by city error",
    });
  }
};



/**
 * =================================================
 * update if shop open and close 
 * =================================================
 * Rules:
 * - Only approved + active shops
 */
export const toggleShopOpen = async (req, res) => {
  try {
    const { shopId } = req.params;

    const shop = await Shop.findById(shopId)
      .populate("owner", "-password")

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    if (shop.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    shop.isOpenNow = !shop.isOpenNow;
    await shop.save();

    // 🔥 repopulate after save (optional but clean)
    await shop.populate("owner", "name email role");

    return res.status(200).json({
      success: true,
      message: `Shop is now ${shop.isOpenNow ? "Open" : "Closed"
        }`,
      shop,
    });
  } catch (error) {
    console.error("Toggle shop error:", error);
    return res.status(500).json({
      success: false,
      message: "Toggle shop error",
    });
  }
};
