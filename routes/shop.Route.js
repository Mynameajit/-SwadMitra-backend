import { Router } from 'express';
import { isAuthenticated } from '../middleware/AuthMiddleware.js';
import {upload} from '../middleware/multer.js';
import { createShop, deleteShop, getMyShop, getShopByCity, updateShop } from '../controllers/shop.Controller.js';

const router = Router();

router.post('/create', isAuthenticated, upload.single("image"), createShop);

router.put('/update/:shopId', isAuthenticated, upload.single("image"), updateShop);

router.delete('/delete/:shopId', isAuthenticated, deleteShop);
//get my shop
router.get('/get', isAuthenticated, getMyShop);
router.get('/getShop-by-city/:city', getShopByCity);

export default router;
