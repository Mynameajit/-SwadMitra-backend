
import {Router} from 'express';
import { getUser, Signin, Signout, SignUp } from '../controllers/Auth.Controller.js';
import { isAuthenticatedUser } from '../middleware/isAuthenticatedUser.js';


const router = Router();

/* ================= CUSTOMER ================= */
router.post('/signup', SignUp);
router.post('/signin', Signin);
router.get('/me', isAuthenticatedUser, getUser);
router.post('/signout',isAuthenticatedUser, Signout);


export default router;
