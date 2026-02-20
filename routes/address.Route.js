

import { Router } from 'express';
import { addAddress, delateAddress, getAddress, updateAddress, updateDefaultAddress } from '../controllers/address.Controller.js';
import { isAuthenticatedUser } from '../middleware/isAuthenticatedUser.js';

const router = Router();

router.post('/add', isAuthenticatedUser, addAddress);
router.post('/get', isAuthenticatedUser, getAddress);
router.post('/update/:addressId', isAuthenticatedUser, updateAddress);
router.post('/set-default/:addressId', isAuthenticatedUser, updateDefaultAddress);
router.post('/delate/:addressId', isAuthenticatedUser, delateAddress);


export default router;
