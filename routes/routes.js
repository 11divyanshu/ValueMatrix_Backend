import express from 'express';
import { sendOTPEmail } from '../controllers/mail-controller.js';
import { userSignup, userLogin, vaildateSignupDetails, testAPI } from '../controllers/userController.js';
import {sendOTPSMS} from "../controllers/sms-controller.js";
import { tokenGenerator } from '../controllers/token-controller.js';
import passport from 'passport';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

// User Routes
router.post('/userSignup', userSignup);
router.post('/userLogin', userLogin);
router.post('/validateSignup', vaildateSignupDetails);

// sending mails
router.post('/OTPMail', sendOTPEmail);

// sending sms
router.post('/OTPSms', sendOTPSMS);

// jwt
router.post('/generateToken', tokenGenerator);

// jwt test api
router.post('/test', verifyToken, testAPI );
export default router;