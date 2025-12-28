import { Router } from 'express';
import { isAuthenticated } from '../middleware/AuthMiddleware.js';
import { getMyOrders, placeOrder } from '../controllers/order.Controller.js';

const router = Router();

router.post('/create', isAuthenticated, placeOrder);
router.get('/get-myOrders', isAuthenticated, getMyOrders);


export default router;
