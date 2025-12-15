import express from "express";
import {
  createItem,
  updateItem,
  deleteItem,
  getAllItems,
  getItemByShopId,
  grtItemsByCity
} from "../controllers/item.Controller.js";
import { isAuthenticated } from "../middleware/AuthMiddleware.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();

router.post('/create', isAuthenticated, upload.single("image"), createItem);

router.put('/update/:itemId', isAuthenticated, upload.single("image"), updateItem);

router.delete('/delete/:itemId', isAuthenticated, deleteItem);

router.get('/get-by-id/:shopId', getItemByShopId);

router.get('/get', getAllItems);

router.get('/getItems-by-city/:city', grtItemsByCity);

export default router;
