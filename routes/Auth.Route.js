
import {Router} from 'express';
import { Signin, Signout, SignUp } from '../controllers/Auth.Controller.js';
import { isAuthenticated } from '../middleware/AuthMiddleware.js';

const router = Router();

router.post('/signup', SignUp);
router.post('/signin', Signin);
router.post('/signout', Signout);


export default router;
