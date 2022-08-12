import express from 'express';
import verifyToken from '../middleware/auth.js';
import multer from "multer";

import { sendOTPEmail, UpdateEmailOTP } from '../controllers/mail-controller.js';
import { userSignup, userLogin, vaildateSignupDetails,  getUserFromId, updateUserDetails, logout, updateProfileImage } from '../controllers/userController.js';
import {sendOTPSMS, updateContactOTP} from "../controllers/sms-controller.js";
import { getUserIdFromToken, tokenGenerator } from '../controllers/token-controller.js';
import { adminLogin } from '../controllers/adminController.js';
import { getUserNotification, markNotiReadForUser, pushNotification, sendEmailNotification } from '../controllers/notification-controller.js';
import { sendOneSignalNotification } from '../controllers/oneSignal.js';
import {addJob, exportJobDetails, listJobs, updateJob, GetJobFromId} from "../controllers/job-controller.js";

const upload = multer();
const router = express.Router();

// User Routes
router.post('/userSignup', userSignup);
router.post('/userLogin', userLogin);
router.post('/validateSignup', vaildateSignupDetails);
router.post('/getUserFromId', verifyToken, getUserFromId);
router.post('/updateUserDetails', verifyToken,updateUserDetails);
router.post('/updateProfilePicture',upload.any(),verifyToken, updateProfileImage);
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

// Notifications API
router.post('/pushNotification', verifyToken, pushNotification);
router.post('/getUserNotification', verifyToken, getUserNotification);
router.post('/markNotificationRead', verifyToken, markNotiReadForUser);
router.post('/sendOneSignalNotification', verifyToken, sendOneSignalNotification);

// Email Notifications
router.post('/sendEmailNotification', verifyToken, sendEmailNotification);

// Job
router.post("/addJob", verifyToken, addJob);
router.post("/listJob", listJobs);
router.post("/updateJobDetails", verifyToken, updateJob);
router.post("/exportJobDetails", exportJobDetails);
router.post("/getJobFromId", verifyToken, GetJobFromId);
export default router;