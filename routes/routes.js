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
  getUserInviteFromResetPassId,
  setProfile,
  getJobInvitations,
  handleCandidateJobInvitation,
  fetchCountry,
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
  downloadResume,
  addAdminUser,
} from "../controllers/adminController.js";

import {
  getUserNotification,
  markNotiReadForUser,
  pushNotification,
  sendEmailNotification,
  whatsappMessage,
} from "../controllers/notification-controller.js";
import { sendOneSignalNotification } from "../controllers/oneSignal.js";
import {
  addJob,
  exportJobDetails,
  listJobs,
  updateJob,
  GetJobFromId,
  sendJobInvitations,
  listJobsCandidate,
} from "../controllers/job-controller.js";
import {
  resetPassword,
  resetPasswordByContact,
  resetPasswordByEmail,
  resetPasswordByUsername,
} from "../controllers/passwordController.js";
import {
  addCompanyUser,
  filterCompany,
} from "../controllers/companyController.js";
import { addSkill, getSkills } from "../controllers/skillController.js";
import { getUserInterviewApplications } from "../controllers/interviewApplication-controller.js";

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
router.post("/getUserInviteFromResetPassId", getUserInviteFromResetPassId);
router.post("/setProfile", setProfile);
router.post("/fetchCountry", fetchCountry);

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
router.post("/getJobInvitations", verifyToken, getJobInvitations);
router.post(
  "/handleCandidateJobInvitation",
  verifyToken,
  handleCandidateJobInvitation
);

// Company Routes
router.post("/submitCompanyDetails", verifyToken, submitCompanyDetails);
router.post("/addCompanyUser", verifyToken, addCompanyUser);
router.post("/filterCompany/:time/:vacancy/:id", filterCompany);

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
router.post("/addAdminUser", verifyToken, addAdminUser);

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

//trillio Whatsapp
router.post("/sendWhatsappNotification", verifyToken, whatsappMessage);

// Job
router.post("/addJob", verifyToken, addJob);
router.post("/listJob/:id", listJobs);
router.post("/listJobCandidate", listJobsCandidate);
router.post("/updateJobDetails", verifyToken, updateJob);
router.post("/exportJobDetails", exportJobDetails);
router.post("/getJobFromId", verifyToken, GetJobFromId);
router.post("/sendJobInvitation", verifyToken, sendJobInvitations);

// Interview Applications
router.post(
  "/getUserInterviewApplications",
  verifyToken,
  getUserInterviewApplications
);

// Skills Routes
router.post("/addSkills", verifyToken, addSkill);
router.post("/getSkills", verifyToken, getSkills);

export default router;