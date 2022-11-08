import express from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import Razorpay from "razorpay"
import verifyToken from "../middleware/auth.js";
import multer from "multer";
import { } from "dotenv/config";
import User from "../models/userSchema.js"
import userCredit_info from "../models/userCreditSchema.js"
import {
  sendOTPEmail,
  UpdateEmailOTP,
  sendForwardedMail,
} from "../controllers/mail-controller.js";

import {
  userSignup,
  userLogin,
  vaildateSignupDetails,
  getUserFromId,
  getUser,
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
  getCountryList,
  handleXIInterview
} from "../controllers/userController.js";

import { sendOTPSMS, updateContactOTP } from "../controllers/sms-controller.js";

import {
  getUserIdFromToken,
  tokenGenerator,
} from "../controllers/token-controller.js";


import {
  adminLogin,
  companyList,
  getXIList,
  getXIUserList,
  getSuperXIUserList,
  postXIUserLevel,
  userList,
  downloadResume,
  addAdminUser,
  addTaxId,
  findAndUpdateTax,
  findAndDeleteTax,
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
  listBinJobs,
  updateJob,
  GetJobFromId,
  sendJobInvitations,
  listJobsCandidate,
  archiveJob,
  approveJob,
  listOfUnapproveJobs,
  getJobBinById
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
  getCompanyUserList
} from "../controllers/companyController.js";
import { addSkill, getSkills } from "../controllers/skillController.js";
import {
  getInterviewApplication,
  getUserInterviewApplications,
  getXIEvaluationList,
  updateEvaluation,
  getXIEvaluatedReports,
  getCandidateEvaluation,
  interviewApplicationStatusChange,
  updateInterviewApplication,
  XIPerformance,
  updateXIInterviewApplication,
  getXIInterviewList
} from "../controllers/interviewApplication-controller.js";
import Routes from "twilio/lib/rest/Routes.js";
import { addEvaluationQuestion, addInterviewQuestion, fetchInterviewQuestion, updateInterviewQuestion } from "../controllers/evaulationQuestion-controller.js";
import {
  addCompanyList,
  addUniversityList,
  getCompanyList,
  getSchoolList,
  checkCompany,
  listUnapproveCompany,
  approveCompany,

} from "../controllers/dbListDataController.js";

import {
  addCandidate,
  listCandidate,
  findAndDeleteCandidate,
  findAndUpdateCandidate,
  eligibleCandidateList,
  saveCandidateReport,
  eligibleJobsForCandidate,
} from "../controllers/candidateController.js";

import {
  save,
  update,
  updateMany,
  read,
} from "../controllers/commonController.js";

const router = express.Router();

// Profile Image Upload
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "media/profileImg");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.user_id + "-profileImg.png");
  },
});
var upload = multer({ storage: storage });

// Candidate Resume Upload
var storage1 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "media/resume");
  },
  filename: (req, file, cb) => {
    // console.log(req.body);
    cb(null, req.body.user_id + "-resume");
  },
});
var upload1 = multer({ storage: storage1 });

// User Routes
router.post("/userSignup", userSignup);
router.post("/userLogin", userLogin);
router.post("/validateSignup", vaildateSignupDetails);
router.post("/getUserFromId", verifyToken, getUserFromId);
router.post("/getUser", verifyToken, getUser);
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
router.post("/getCountryList", getCountryList);
router.post("/handleXIInterview", handleXIInterview);

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
router.post("/getCandidateEvaluation", verifyToken, getCandidateEvaluation);
// router.post("/approveCompany", approveCompany);
router.get("/unapprovedJobsList", listOfUnapproveJobs);
router.get("/getCompanyUserList", getCompanyUserList);



// Reset Password
router.post("/sendResetPasswordMail", resetPasswordByEmail);
router.post("/sendResetPasswordSMS", resetPasswordByContact);
router.post("/sendResetPasswordUsername", resetPasswordByUsername);
router.post("/resetPassword", resetPassword);

// Admin Routes
router.post("/adminLogin", adminLogin);
router.post("/getCompanyList", verifyToken, companyList);
router.post("/getXIList", verifyToken, getXIList);
router.post("/getXIUserList", verifyToken, getXIUserList);
router.post("/getSuperXIUserList", verifyToken, getSuperXIUserList);
router.post("/postXIUserLevel", verifyToken, postXIUserLevel);
router.post("/getUserList", verifyToken, userList);
router.post("/downloadResume", verifyToken, downloadResume);
router.post("/addAdminUser", verifyToken, addAdminUser);
router.post("/addTaxId", verifyToken, addTaxId);
router.post("/updateTaxId/:id", verifyToken, findAndUpdateTax);
router.post("/deleteTaxId/:id", verifyToken, findAndDeleteTax);

// Sending mails
router.post("/updateEmailOTP", verifyToken, UpdateEmailOTP);
router.post("/OTPMail", sendOTPEmail);
router.post("/sendForwardedMail", sendForwardedMail);

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
router.post("/addJob", addJob);
router.post("/listJob/:id", listJobs);
router.get("/listBinJob/:id", listBinJobs);
router.post("/listJobCandidate", listJobsCandidate);
router.post("/updateJobDetails", verifyToken, updateJob);
router.post("/exportJobDetails", exportJobDetails);
router.post("/getJobFromId", verifyToken, GetJobFromId);
router.post("/getJobBinById", verifyToken, getJobBinById);
router.post("/sendJobInvitation", verifyToken, sendJobInvitations);
router.post("/archiveJob", archiveJob);
router.post("/approveJob", approveJob);



// Interview Applications
router.post(
  "/getUserInterviewApplications",
  verifyToken,
  getUserInterviewApplications
);

// Skills Routes
router.post("/addSkills", verifyToken, addSkill);
router.post("/getSkills", verifyToken, getSkills);

// XI Routes
router.post("/listXIEvaluation", verifyToken, getXIEvaluationList);
router.post("/getXIInterviewList", verifyToken, getXIInterviewList);
router.post("/listXIEvaluatedReports", verifyToken, getXIEvaluatedReports);
router.post("/getInterviewApplication", verifyToken, getInterviewApplication);
router.post("/updateEvaluation", verifyToken, updateEvaluation);
router.put("/updateInterviewApplication", updateInterviewApplication);
router.put("/updateXIInterviewApplication", updateXIInterviewApplication);
router.post("/XIPerformance", XIPerformance);


// Evaluation Question Routes
router.post("/addEvaluationQuestions", verifyToken, addEvaluationQuestion);
router.post("/addInterviewQuestions", verifyToken, addInterviewQuestion);
router.get("/fetchInterviewQuestions", verifyToken, fetchInterviewQuestion);
router.post("/updateInterviewQuestion", updateInterviewQuestion);

// DB List Data Routes
router.post("/addCompanyList", verifyToken, addCompanyList);
router.get("/getCompanyList", getCompanyList);
router.post("/addUniversityList", verifyToken, addUniversityList);
router.get("/getSchoolList", getSchoolList);
router.post("/jobTitles", jobTitles);
router.post("/addcompany", addcompany);
router.get("/getJobTitles", getJobTitles);
router.get("/listUnapproveTitles", listUnapproveTitles);
router.post("/approveTitle", approveTitle);


// Candidate Routes
router.post("/addCandidate", verifyToken, addCandidate);
router.post("/getCandidateList", listCandidate);
router.post("/deleteCandidate", findAndDeleteCandidate);
router.put("/updateCandidate/:id", findAndUpdateCandidate);
router.post("/eligibleCandidateList", eligibleCandidateList);
router.get("/saveCandidateReport", saveCandidateReport);
router.get("/eligibleJobsForCandidate", eligibleJobsForCandidate);

// common CRUD operations
router.post("/add", (req, res) => {
  const { body } = req;
  save(body.model, body.data, (data) => {
    res.send(data);
  });
});

router.post("/update", (req, res) => {
  const { body } = req;
  update(body.model, body.data, (data) => {
    res.send(data);
  });
});

router.post("/updateMany", (req, res) => {
  const { body } = req;
  updateMany(body.model, body.data, (data) => {
    res.send(data);
  });
});

router.post("/read", (req, res) => {
  const { body } = req;
  read(body.model, body.data, (data) => {
    res.send(data);
  });
});

import {
  addSlot,
  availableSlots,
  bookSlot,
  slotUpdate,
  slotdelete,
  XISlots,
  findCandidateByEmail,
  slotDetailsOfXI,
  slotDetailsOfXIinterview,
  slotDetailsOfUser,
  userInterviewsDetails,
  ValidateSlot,
  priorityEngine
} from "../controllers/slots.js";

router.get("/slotDetailsOfUser", slotDetailsOfUser);
router.get("/userInterviewsDetails", userInterviewsDetails);
router.get("/slotDetailsOfXI", slotDetailsOfXI);
router.get("/slotDetailsOfXIinterview", slotDetailsOfXIinterview);
router.get("/XISlots", XISlots);
router.post("/findCandidateByEmail", findCandidateByEmail);

router.post("/ValidateSlot", ValidateSlot);
router.post("/addSlot", (req, res) => {

  const { body } = req;
  addSlot(body, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(data);
    }
  });
});

router.post("/availableSlots", (req, res) => {
  const { body } = req;

  availableSlots(body, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(data);
    }
  });
});


router.post("/bookSlot", (req, res) => {
  const { body } = req;
  bookSlot(body, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(data);
    }
  });
});

router.put("/updateSlot", (req, res) => {
  slotUpdate(req, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(data);
    }
  });
});


router.delete("/deleteSlot", (req, res) => {
  slotdelete(req, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(data);
    }
  });
});

// Languages Routes
import {
  addLanguages,
  listOfLanguages,
  jobTitles,
  getJobTitles,
  listUnapproveTitles,
  approveTitle,
  addcompany
} from "../controllers/languages.js";


router.post("/addLanguages", (req, res) => {
  addLanguages(req.body, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(data);
    }
  });
});

router.get("/languagesList", (req, res) => {
  listOfLanguages(req, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(data);
    }
  });
});




// Check Company
router.post("/checkCompany", checkCompany);
router.get("/listUnapproveCompany", listUnapproveCompany);
router.post("/approveCompany", approveCompany);



// CountryCode Routes
import {
  addCountryCodes,
  listOfCountryaCodes
} from "../controllers/countryCodeController.js";
router.post("/addCountryCodes", (req, res) => {
  addCountryCodes(req.body, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(data);
    }
  });
});

router.get("/countryCodeList", (req, res) => {
  listOfCountryaCodes(req, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(data);
    }
  });
});


router.post('/interviewApplicationstatusChange', interviewApplicationStatusChange);

import { jobStatusChange, jobDetailsUploadedByUser, jobDetailsByJobId, UserDetailsByJobId } from "../controllers/job-controller.js";
router.post("/jobStatusChange", jobStatusChange);
router.get("/jobDetailsUploadedByUser", jobDetailsUploadedByUser);
router.get("/jobDetailsByJobId", jobDetailsByJobId);
router.get("/UserDetailsByJobId", UserDetailsByJobId)

import { insertUserInterviewApplications } from '../controllers/xiInterviewApplication-controller.js';
import { addXICategory, ListXICategory, updateXICategory, addXILevel, ListXILevel, updateXILevel, addXIMultiplier, ListXIMultiplier, updateXIMultiplier } from "../controllers/XiCategory.js";
import { updateXIInfo, addXIInfo, getXIInfo, getDialerToken, getDialerCall } from "../controllers/xi_infoController.js";

router.post('/insertUserInterviewApplications', insertUserInterviewApplications);

router.get("/UserDetailsByJobId", UserDetailsByJobId);

import { getinterviewdetails, checkinterviewdetails, updateinterviewcheck, nullallchecks } from "../controllers/interview-controller.js";
router.post('/getinterviewdetails', getinterviewdetails);
router.post('/checkinterviewdetails', nullallchecks, checkinterviewdetails);
router.post('/updateinterviewcheck', updateinterviewcheck);
router.get('/getDialerToken',getDialerToken);
router.post('/getDialerCall',getDialerCall);



//Xi Category , limit ,performance Multiplier


router.post('/updateXICategory', updateXICategory);
router.post('/addXICategory', addXICategory);
router.get('/listXICategory', ListXICategory);



router.post('/updateXILevel', updateXILevel);
router.post('/addXILevel', addXILevel);
router.get('/listXILevel', ListXILevel);

router.post('/updateXIMultiplier', updateXIMultiplier);
router.post('/addXIMultiplier', addXIMultiplier);
router.get('/listXIMultiplier', ListXIMultiplier);


//Credits
import { addCreditCategory, ListCreditCategory, updateCreditCategory, addCreditConverter, ListCreditConverter, updateCreditConverter, getCreditInfoList, updateUserCreditInfo, addCoupon } from "../controllers/creditControllers.js";
import CreditCategory from "../models/creditCategorySchema.js";
import Transaction from "../models/transactionSchema.js";
import { request } from "https";
import { getTransactions,updateWallet,userRequestUpdate,userAcceptUpdate } from "../controllers/transactionController.js";

router.post('/updateCreditCategory', updateCreditCategory);
router.post('/addCreditCategory', addCreditCategory);
router.get('/listCreditCategory', ListCreditCategory);

router.post('/updateCreditConverter', updateCreditConverter);
router.post('/addCreditConverter', addCreditConverter);
router.get('/listCreditConverter', ListCreditConverter);





router.post('/getCreditInfoList', getCreditInfoList);
router.post('/updateUserCreditInfo', updateUserCreditInfo);




//XI Info

router.post('/updateXIInfo', updateXIInfo);
router.post('/addXIInfo', addXIInfo);
router.get('/getXIInfo', getXIInfo);

// priority Engine

router.post('/priorityEngine', priorityEngine);
router.post('/addCoupon', addCoupon);

//Transactions

router.get('/getTransactions', getTransactions);
router.post('/updateWallet', updateWallet);
router.get('/userRequestUpdate', userRequestUpdate);
router.get('/userAcceptUpdate', userAcceptUpdate);

//Razorpay
router.post("/getUserCurrentCredit", async (req,res) => {
  try{
    console.log(req.body);
    userCredit_info.findOne({userId:req.body.userId}, async function (err, res1) {
      if (res1) {
        return res.status(200).json({ data: res1 });
      }
      res.status(403).json({ Message: "Wallet Not Found" });
    });
  }catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});
router.post("/payment/orders", async (req, res) => {
  try {
    console.log(req.body);
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });
    // console.log(instance)
    let amount = 0;
    let data = await CreditCategory.find({ category: req.body.user_type });
    console.log(data)


    let tData = {
      applicantId: req.body.userId,
      amount: data[0].amount * req.body.amount * 100,
      credit: req.body.amount,
      transactionDate: new Date(),

    }
    let transactionData = new Transaction(tData);

    await transactionData.save();



    const options = {
      amount: data[0].amount * req.body.amount *100, // amount in smallest currency unit
      currency: "INR",
      receipt: "receipt_order_74394",
      
    };

    const order = await instance.orders.create(options);
    console.log(order)
    if (!order) return res.status(500).send("Some error occured");

    res.json({order:order ,id:transactionData._id});
  } catch (error) {
    res.status(500).send(error);
  }
});
router.post("/payment/success", async (req, res) => {
  try {
    // getting the details back from our font-end
    console.log(req.body)
    const {
      orderCreationId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      
    } = req.body.data;
    let id =req.body.id;

   let data = await Transaction.findOneAndUpdate({ _id: id }, {
      orderCreationId: orderCreationId,
      razorpayPaymentId: razorpayPaymentId,
      razorpayOrderId: razorpayOrderId,
      razorpaySignature: razorpaySignature,
    },async function(err,res){
      console.log(res)
    }).clone()

console.log("razorpaysignature : " + razorpaySignature)
   let data1 = await User.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.userId) }, {
      $push:{
        transactions:id
      }
    }).clone()
    // console.log(data1)
    
    let data2 = await userCredit_info.findOneAndUpdate({ userId: mongoose.Types.ObjectId(req.body.userId) }, {
      $inc:{
        credit: req.body.credit
      }
    }).clone()
    
    // console.log(data2)

     

    // Creating our own digest
    // The format should be like this:
    // digest = hmac_sha256(orderCreationId + "|" + razorpayPaymentId, secret);
    const shasum = crypto.createHmac("sha256", "w2lBtgmeuDUfnJVp43UpcaiT");

    shasum.update(`${orderCreationId}|${razorpayPaymentId}`);

    const digest = shasum.digest("hex");
    console.log("Digest : " + digest);
    // comaparing our digest with the actual signature
    // if (digest !== razorpaySignature)
    //   return res.status(400).json({ msg: "Transaction not legit!" });

    // THE PAYMENT IS LEGIT & VERIFIED
    // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT

    res.json({
      msg: "success",
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
    });
  } catch (error) {
    console.log(error.message)
    res.status(500).send(error);
  }
});














export default router;



