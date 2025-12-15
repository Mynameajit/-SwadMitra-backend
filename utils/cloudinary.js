
import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"


export const uploadOnCloudinary = async (file, folder) => {

    try {

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        const result = await cloudinary.uploader.upload(file, {
            resource_type: "auto",
        })
        fs.unlink(file, (err) => {
            if (err) console.error("Error deleting local file:", err);
        })
        return result.secure_url
    } catch (error) {
        console.log("cloudinary error", error);

    }


}