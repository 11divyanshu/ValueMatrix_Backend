import express from "express";
import verifyToken from "../middleware/auth.js";
import multer from "multer";

import {
  sendOTPEmail,
  UpdateEmailOTP,
} from "../controllers/mail-controller.js";
import {
  userSignup,
  userLogin,
  vaildateSignupDetails,
  getUserFromId,
  updateUserDetails,
  logout,
  updateProfileImage,
  getProfileImg,
  uploadCandidateResume,
  submitCandidateResumeDetails,
  submitCompanyDetails,
} from "../controllers/userController.js";
import { sendOTPSMS, updateContactOTP } from "../controllers/sms-controller.js";
import {
  getUserIdFromToken,
  tokenGenerator,
} from "../controllers/token-controller.js";
import {
  adminLogin,
  companyList,
  userList,
  downloadResume
} from "../controllers/adminController.js";
import {
  getUserNotification,
  markNotiReadForUser,
  pushNotification,
  sendEmailNotification,
} from "../controllers/notification-controller.js";
import { sendOneSignalNotification } from "../controllers/oneSignal.js";
import {
  addJob,
  exportJobDetails,
  listJobs,
  updateJob,
  GetJobFromId,
} from "../controllers/job-controller.js";
import {
  resetPassword,
  resetPasswordByContact,
  resetPasswordByEmail,
  resetPasswordByUsername,
} from "../controllers/passwordController.js";
import { addCompanyUser } from "../controllers/companyController.js";
import { addSkill, getSkills } from "../controllers/skillController.js";

const router = express.Router();

// Profile Image Upload
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "media/profileImg");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.user_id + "-profileImg");
  },
});
var upload = multer({ storage: storage });

// Candidate Resume Upload
var storage1 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "media/resume");
  },
  filename: (req, file, cb) => {
    console.log(req.body);
    cb(null, req.body.user_id + "-resume");
  },
});
var upload1 = multer({ storage: storage1 });

// User Routes
router.post("/userSignup", userSignup);
router.post("/userLogin", userLogin);
router.post("/validateSignup", vaildateSignupDetails);
router.post("/getUserFromId", verifyToken, getUserFromId);
router.post("/getProfileImage", verifyToken, getProfileImg);
router.post("/updateUserDetails", verifyToken, updateUserDetails);
router.post(
  "/updateProfilePicture",
  verifyToken,
  upload.single("file"),
  updateProfileImage
);
router.post("/logout", logout);

// Candidate Routes
router.post(
  "/uploadCandidateResume",
  verifyToken,
  upload1.single("file"),
  uploadCandidateResume
);
router.post(
  "/submitCandidateDetails",
  verifyToken,
  submitCandidateResumeDetails
);

// Company Routes
router.post("/submitCompanyDetails", verifyToken, submitCompanyDetails);
router.post("/addCompanyUser",verifyToken, addCompanyUser);

// Reset Password
router.post("/sendResetPasswordMail", resetPasswordByEmail);
router.post("/sendResetPasswordSMS", resetPasswordByContact);
router.post("/sendResetPasswordUsername", resetPasswordByUsername);
router.post("/resetPassword", resetPassword);

// Admin Routes
router.post("/adminLogin", adminLogin);
router.post("/getCompanyList", verifyToken, companyList);
router.post("/getUserList", verifyToken, userList);
router.post("/downloadResume", verifyToken, downloadResume);

// Sending mails
router.post("/updateEmailOTP", verifyToken, UpdateEmailOTP);
router.post("/OTPMail", sendOTPEmail);

// sending sms
router.post("/OTPSms", sendOTPSMS);
router.post("/updateContactOTP", verifyToken, updateContactOTP);

// jwt
router.post("/generateToken", tokenGenerator);
router.post("/getUserIdFromToken", verifyToken, getUserIdFromToken);

// Notifications API
router.post("/pushNotification", verifyToken, pushNotification);
router.post("/getUserNotification", verifyToken, getUserNotification);
router.post("/markNotificationRead", verifyToken, markNotiReadForUser);
router.post(
  "/sendOneSignalNotification",
  verifyToken,
  sendOneSignalNotification
);

// Email Notifications
router.post("/sendEmailNotification", verifyToken, sendEmailNotification);

// Job
router.post("/addJob", verifyToken, addJob);
router.post("/listJob", listJobs);
router.post("/updateJobDetails", verifyToken, updateJob);
router.post("/exportJobDetails", exportJobDetails);
router.post("/getJobFromId", verifyToken, GetJobFromId);

// Skills Routes
router.post("/addSkills", verifyToken, addSkill);
router.post("/getSkills", verifyToken, getSkills);

export default router;
