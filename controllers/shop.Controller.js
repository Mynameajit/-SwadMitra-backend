import Shop from "../models/shop.Models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createShop = async (req, res) => {
  try {
    const { name, city, state, address, pinCode, mobile } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    const shop = await Shop.create({
      name,
      city,
      state,
      address,
      pinCode,
      mobile,
      image,
      owner: req.user._id,
    });

    await shop.populate("owner");

    return res.status(200).json({
      success: true,
      message: "Shop Created Successfully",
      shop,
    });
  } catch (error) {
    console.error("Create shop error:", error);
    return res.status(400).json({
      success: false,
      message: "Create shop error",
      error: error.message,
    });
  }
};


export const updateShop = async (req, res) => {
  try {
    const { name, city, state, address, mobile, pinCode } = req.body;
    const { shopId } = req.params;

    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    const updatedData = {
      name,
      city,
      state,
      address,
      pinCode,
      mobile,
      ...(image && { image }), // only add image if provided
    };

    const shop = await Shop.findByIdAndUpdate(shopId, updatedData, {
      new: true,
    }).populate("owner");

    if (!shop) {
      return res
        .status(404)
        .json({ success: false, message: "Shop not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Shop Updated Successfully",
      shop,
    });
  } catch (error) {
    console.error("Shop update error:", error);
    return res.status(400).json({
      success: false,
      message: "Shop update error",
      error: error.message,
    });
  }
};


export const deleteShop = async (req, res) => {
  try {
    const shopId = req.params.shopId
    if (shopId) {
      return res.status(400).json({ success: false, message: "shopId is required" })
    }
    const shop = await Shop.findByIdAndDelete(shopId)
    return res.status(200).json({ success: true, message: "Shop Deleted Successfully", shop })

  } catch (error) {
    console.log("delate shop error", error);
    return res.status(400).json({ success: false, message: "delete shop error", error })
  }
}

export const getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id })
      .populate("owner", "-password")
      .populate({
        path: "items",
        options: { sort: { updatedAt: -1 } }
      }).populate("items")

    if (!shop) {
      return res.status(400).json({ success: false, message: "Shop not found" })
    }
    return res.status(200).json({ success: true, message: "Shop fetched Successfully", shop })

  } catch (error) {
    console.log("get my shop error", error);
    return res.status(400).json({ success: false, message: "get my shop error", error })
  }
}


export const getShopByCity = async (req, res) => {
  const { city } = req.params
  try {
  const shop = await Shop.find({
  city: { $regex: new RegExp(`^${city}$`, "i") }
}).populate("items")

    if (!shop) {
      return res.status(400).json({ success: false, message: "Shop not found" })
    }
    return res.status(200).json({ success: true, message: "Shop fetched Successfully", shop })

  } catch (error) {
    console.log("get my shop error", error);
    return res.status(400).json({ success: false, message: "get shop by City error", error })
  }
}