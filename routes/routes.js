import express from 'express';
import { sendOTPEmail, UpdateEmailOTP } from '../controllers/mail-controller.js';
import { userSignup, userLogin, vaildateSignupDetails, testAPI, getUserFromId, updateUserDetails, logout } from '../controllers/userController.js';
import {sendOTPSMS, updateContactOTP} from "../controllers/sms-controller.js";
import { getUserIdFromToken, tokenGenerator } from '../controllers/token-controller.js';
import passport from 'passport';
import verifyToken from '../middleware/auth.js';
import { adminLogin } from '../controllers/adminController.js';
import { getUserNotification, markNotiReadForUser, pushNotification, sendEmailNotification } from '../controllers/notification-controller.js';

const router = express.Router();

// User Routes
router.post('/userSignup', userSignup);
router.post('/userLogin', userLogin);
router.post('/validateSignup', vaildateSignupDetails);
router.post('/getUserFromId', verifyToken, getUserFromId);
router.post('/updateUserDetails', verifyToken,updateUserDetails);
router.post('/logout',logout);  
// Admin Routes
router.post('/adminLogin',adminLogin);

// sending mails
router.post('/updateEmailOTP', verifyToken, UpdateEmailOTP);
router.post('/OTPMail', sendOTPEmail);

// sending sms
router.post('/OTPSms', sendOTPSMS);
router.post('/updateContactOTP', verifyToken,updateContactOTP);

// jwt
router.post('/generateToken', tokenGenerator);
router.post('/getUserIdFromToken',verifyToken, getUserIdFromToken);

// jwt test api
router.post('/test', verifyToken, testAPI );

// Notifications API
router.post('/pushNotification', verifyToken, pushNotification);
router.post('/getUserNotification', verifyToken, getUserNotification);
router.post('/markNotificationRead', verifyToken, markNotiReadForUser);

// Email Notifications
router.post('/sendEmailNotification', verifyToken, sendEmailNotification);
export default router;