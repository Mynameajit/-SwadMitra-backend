import { Router } from 'express';
import { upload } from '../middleware/multer.js';
import { createShop, deleteShop, getMyShop, getShopByCity, toggleShopOpen, updateShop } from '../controllers/shop.Controller.js';
import { isAuthenticatedDashboard } from '../middleware/isAuthenticatedDashboard.js';

const router = Router();

router.post('/create', isAuthenticatedDashboard, upload.single("image"), createShop);

router.put('/update/:shopId', isAuthenticatedDashboard, upload.single("image"), updateShop);

router.delete('/delete/:shopId', isAuthenticatedDashboard, deleteShop);
/* Toggle Open / Close */
router.patch(
    "/toggle/:shopId",
    isAuthenticatedDashboard,
    toggleShopOpen
);

//get my shop
router.get('/get', isAuthenticatedDashboard, getMyShop);
router.get('/city/:city', getShopByCity);

export default router;
