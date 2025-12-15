

import { Router } from 'express';
import { addAddress, delateAddress, getUser, updateAddress } from '../controllers/User.Controller.js';
import { isAuthenticated } from '../middleware/AuthMiddleware.js';

const router = Router();

router.get('/me', isAuthenticated, getUser);
router.post('/address/add', isAuthenticated, addAddress);
router.post('/address/update/:addressId', isAuthenticated, updateAddress);
router.post('/address/delate/:addressId', isAuthenticated, delateAddress);


export default router;
