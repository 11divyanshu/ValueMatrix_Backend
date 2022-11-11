import mongoose from "mongoose";
import Job from "../models/jobSchema.js";
import JobBin from "../models/jobBinSchema.js";
import User from "../models/userSchema.js";
import Candidate from "../models/candidate_info.js";
import Notification from "../models/notificationSchema.js";
import { } from "dotenv/config.js";
import fs from "fs";
import passwordHash from "password-hash";
import json2xls from "json2xls";
import v4 from "uuid/v4.js";
import sendGridMail from "@sendgrid/mail";
import axios from "axios";
import InterviewApplication from "../models/interviewApplicationSchema.js";
import job from "../models/jobSchema.js"
import company from "../models/companyListSchema.js";
import holdWallet from "../models/holdWalletSchema.js";
import userCredit_info from "../models/userCreditSchema.js";
import { response } from "express";

const url = process.env.BACKEND_URL;
const frontendUrl = process.env.FRONTEND_URL;

sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

function generatePassword() {
  var length = 8,
    charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&",
    retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

export const addJob = async (request, response) => {
  try {
    User.findOne({ _id: request.body.user_id }, async function (err, res) {
      console.log(request.body);
      if (res === null || res === undefined) {
        response.status(404).json({ Message: "Admin Not Found" });
        return;
      }
      let getWallet = await userCredit_info.find({userId:request.body.user_id});
      console.log(getWallet)
      if(getWallet[0].credit < request.body.invitations.length){
        response.status(401).json({ Message: "Not Enough Credits" });

      }
      
      
      //console.log(request.body.skills);
      let jobC = {
        jobTitle: request.body.jobTitle,
        jobDesc: request.body.jobDesc,
        uploadBy: request.body.user_id,
        location: request.body.location,
        jobType: request.body.jobType ? request.body.jobType : "Full-Time",
        jobLocation: request.body.jobLocation,
        reqApp: request.body.reqApp,
        validTill: request.body.validTill ? request.body.validTill : null,
        hiringOrganization: request.body.hiringOrganization,
        salary: request.body.salary ? request.body.salary : null,
        perks: request.body.perks ? request.body.perks : null,
        eligibility: request.body.eligibility ? request.body.eligibility : null,
        skills: request.body.skills ? request.body.skills : null,
        questions: request.body.questions ? request.body.questions : [],
        archived: false,
        location: request.body.location,
        showComLogo: request.body.showComLogo,
        showComName: request.body.showComName,
        showEmail: request.body.showEmail,
        showEducation: request.body.showEducation,
        showContact: request.body.showContact,
        draft: request.body.draft,
        invitations: request.body.invitations,
      };

      // console.log(jobC);
      const newJob = new JobBin(jobC);
      await newJob.save();



    
      // console.log("D");
      if (newJob) {
        let candidateList = request.body.candidateList ? request.body.candidateList.map((a) => a.email) : null;
        let asd = await Candidate.updateMany(
          { email: { $in: candidateList } },
          { jobId: newJob._id.valueOf() }
        );


        response
          .status(200)
          .json({ Message: "Job Added Successfully", job: newJob });
        return;
      } else {
        response.status(401).json({ Message: "Error Adding Job" });
        return;
      }
    });
  } catch (error) {
    console.log("Error : ", error);
  }
};

// List Jobs
export const listJobs = async (request, response) => {
  try {
    await Job.find({ uploadBy: request.params.id })
      .sort({ createTime: -1 })
      .exec(async function (err, res) {
        await response.status(200).json({ jobs: res });
        return;
      });
  } catch (error) {
    console.log(error);
  }
};
export const listBinJobs = async (request, response) => {
  try {
    await JobBin.find({ uploadBy: request.params.id })
      .sort({ createTime: -1 })
      .exec(async function (err, res) {
        console.log(res)
        await response.status(200).json({ jobs: res });
        return;
      });
  } catch (error) {
    console.log(error);
  }
};

export const listJobsCandidate = async (request, response) => {
  try {
    let currentDate = new Date().toISOString();

    // console.log(request.params);
    await Job.find({ validTill: { $gte: currentDate } })
      .sort({ createTime: -1 })
      .exec(async function (err, res) {
        // console.log(res);
        await response.status(200).json({ jobs: res });
        return;
      });
  } catch (error) {
    console.log(error);
  }
};

// Update Jobs
export const updateJob = async (request, response) => {
  try {
    // let user1 = null;
    // user1 = res;
    // if (res === undefined || res === null || res.user_type !== "Company") {
    //   response.status(403);
    //   return;
    // }
    //  await User.findOne({ _id: request.body.uploadBy }, function (err, res) {});

    // let job = await Job.findOne({ _id: request.body._id }, function (err, res) {
    //   // if (res.uploadBy !== request.body.uploadBy) {
    //   //   response.status(403);
    //   //   return;
    //   // }

    // }).clone();
    let newJob = await Job.findOne(
      { _id: request.body._id },
      async function (err, user) {
        user.jobTitle = request.body.jobTitle;
        user.jobType = request.body.jobType;
        user.jobDesc = request.body.jobDesc;
        user.reqApp = request.body.reqApp;
        user.location = request.body.location;
        user.jobLocation = request.body.jobLocation;
        user.hiringOrganization = request.body.hiringOrganization;
        user.eligibility = request.body.eligibility;
        user.perks = request.body.perks;
        user.salary = request.body.salary;
        user.skills = request.body.skills;
        user.questions = request.body.questions;
        user.showComLogo = request.body.showComLogo;
        user.showComName = request.body.showComName;
        user.showEmail = request.body.showEmail;
        user.showEducation = request.body.showEducation;
        user.showContact = request.body.showContact;
        await user.save();
        return response.status(200).json({ Success: true });
      }
    ).clone();
  } catch (error) {
    console.log("Error : ", error);
  }
};

export const archiveJob = async (request, response) => {
  try {
    console.log(request.body.archived);
    let statusData = await job.findOneAndUpdate({ _id: request.body._id }, { $set: { archived: request.body.archived } }, { new: true })
    if (statusData.status === request.body.status) {
      response.send({ data: "update successfully" }).status(200);
    } else {
      response.send({ data: "status not updated!" }).status(400);

    }
  }
  catch (err) {
    response.send({ data: "something went wrong", err }).status(400);
  }
};

// Export JobDetails
export const exportJobDetails = async (request, response) => {
  try {
    var today = new Date();
    var date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();

    await Job.findOne({ _id: request.body.job_id }, async function (err, res) {
      if (res === undefined || res.uploadBy._id != request.body.user_id) {
        response.status(403);
        return;
      }

      // Saving and downloading job details
      var filename = res.jobTitle + " - Details " + date + ".xls";
      var file1 = json2xls(JSON.parse(JSON.stringify(res)));
      var detailsFile = await fs.writeFile(filename, file1, "binary", (err) => {
        if (err) console.log("wrtieFileSync Error : ", err);
      });
      await response.download(filename);

      // Getting Canditates
      let candidateArr = res.applicants;
      let query = User.find({ _id: { $in: candidateArr } }).select({
        username: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        contact: 1,
      });
      await query.exec(async function (err1, res1) {
        if (res1 !== undefined) {
          var filename = res.jobTitle + " - Candidates " + date + ".xls";
          var file2 = json2xls(JSON.parse(JSON.stringify(res1)));
          var candidateFile = await fs.writeFile(
            filename,
            file2,
            "binary",
            (err) => {
              if (err) console.log("wrtieFileSync Error : ", err);
            }
          );
          await response.download(filename);
        }
      });
    });
    response.status(200).json({ Message: "Files Downloaded" });
  } catch (error) { }
};

// Get Job From Id
export const GetJobFromId = async (request, response) => {
  try {
    await Job.findOne({ _id: request.body.job_id }, async function (err, res) {
      let applicants = [],
        declined = [],
        invited = [];

      if (res) {
        await User.find({ _id: { $in: res.applicants } }, function (err, res) {
          res.map((result) => {
            InterviewApplication.findOne(
              { applicant: result._id },
              function (err, res) {
                // console.log(res);

                let data = {
                  _id: result._id,
                  appid: res._id,
                  firstName: result.firstName,
                  lastname: result.lastname,
                  contact: result.contact,
                  email: result.email,
                  username: result.username,
                  status: res.status,
                };
                applicants.push(data);
              }
            );
          });
        }).clone();
        // console.log(applicants);
        declined = await User.find({ _id: { $in: res.invitations_declined } });
        invited = await User.find({ _id: { $in: res.invitations } });
        response.status(200).json({ job: res, applicants, declined, invited });
      } else response.status(403).json("Data Not Found");
    });
  } catch (error) { }
};
export const getJobBinById = async (request, response) => {
  try {
    await JobBin.find({ _id: request.body.job_id }, async function (err, res) {
      let applicants = [],
        declined = [],
        invited = [];

      if (res) {
        await User.find({ _id: { $in: res.applicants } }, function (err, res) {
          res.map((result) => {
            InterviewApplication.findOne(
              { applicant: result._id },
              function (err, res) {
                // console.log(res);

                let data = {
                  _id: result._id,
                  appid: res._id,
                  firstName: result.firstName,
                  lastname: result.lastname,
                  contact: result.contact,
                  email: result.email,
                  username: result.username,
                  status: res.status,
                };
                applicants.push(data);
              }
            );
          });
        }).clone();
        // console.log(applicants);
        declined = await User.find({ _id: { $in: res.invitations_declined } });
        invited = await User.find({ _id: { $in: res.invitations } });
        response.status(200).json({ job: res, applicants, declined, invited });
      } else response.status(403).json("Data Not Found");
    });
  } catch (error) { }
};

// Send Invitations To Users
export const sendJobInvitations = async (job) => {
  try {
    let job_id = job._id;
    let candidates = job.invitations;
    // let user_id = request.body.user_id;
    let jobId = "";
    // await User.findOne({ _id: user_id }, async function (err, res) {
    console.log("step 1");
  
    console.log(job_id)
    // pushing in hold Wallet
    let creditHold ={
      jobId:mongoose.Types.ObjectId(job._id) ,
      amount : candidates.length,
      userId:job.uploadBy,
      user_type:"Company",

    }
    let Wallet = new holdWallet(creditHold);
  await Wallet.save();
  //Deducting From Wallet


    let data = await userCredit_info.findOneAndUpdate({userId:job.uploadBy},{$inc : {credit : -candidates.length}})
  


    // await JobBin.findOne({ _id: mongoose.Types.ObjectId(job_id) }, async function (err1, res1) {
    console.log("step 2");
    console.log(job)
    let invitations = [];
    await candidates.forEach(async (candidate, index) => {
      console.log("in the array");
      await User.findOne(
        {
          $or: [
            {
              email: candidate.Email,
            },
            {
              contact: candidate.Contact,
            },
          ],
        },



        async function (error, result) {
          console.log("callback");
          if (result) {
            if (!result.job_invitations.includes(result._id)) {
              let i = result.job_invitations ? result.job_invitations : [];
              i.push((job_id).valueOf());
              invitations.push((result._id));
              result.job_invitations = i;
              await result.save();
              await User.findOneAndUpdate(
                { _id: result._id },
                { job_invitations: i }
              );


              let noti = new Notification({
                forAll: false,
                title: "Job Invitation - " + job.jobTitle,
                message:
                  "You have been invited for the job " +
                  job.jobTitle,
                // " by " +
                // res.username,
                sendTo: [result._id],
                type: "Notification",
              });
              await noti.save();

              let html = `<h1>Job Invitation</h1>
              <br/>
              <p>
                You have been invited for the job <b>${job.jobTitle}</b> 
              </p><br/>
              <p>Check out the job invitations at :</p><br/>
              <a href="${frontendUrl}/user/jobInvitations
              " target="_blank">${frontendUrl}/user/jobInvitations</a>`;

              await sendGridMail.send({
                to: result.email,
                from: "developervm171@gmail.com",
                subject: `Job Invitation for ${job.jobTitle} - Value Matrix`,
                html: html,
              });

              if (index === candidates.length - 1) {
                await Job.findOne(
                  { _id: job._id },
                  async function (err, user) {
                    console.log(invitations)

                    user.invitations = invitations;
                    await user.save();
                  }).clone()
              }
            }
          } else {
            let id = v4();
            let pass = generatePassword();
            let reset_pass_id = v4();
            let newUser = new User({
              username: id,
              firstName: candidate.FirstName ? candidate.FirstName : "",
              lastName: candidate.LastName ? candidate.LastName : "",
              email: candidate.Email,
              contact: candidate.Contact,
              password: passwordHash.generate(pass),
              user_type: "User",
              invite: 1,
              address: candidate.Address ? candidate.Address : null,
              resetPassId: reset_pass_id,
              job_invitations: [job_id],
              tools: job.skills ? job.skills : [],
            });



            await newUser.save();




           
            const CandidadeCount = await Candidate.count();
              
              const candidateInfo = {
                email: candidate.Email,
                phoneNo: candidate.Contact,
                firstName: candidate.FirstName ? candidate.FirstName : "",
                lastName: candidate.LastName ? candidate.LastName : "",
                candidate_id: CandidadeCount + 1,
                jobId:job_id,
              }
             

             
            

            
                let newCandidate = new Candidate(candidateInfo);
                await newCandidate.save();


              
        


            invitations.push(newUser._id);
            let htmltext = `<h1>Invitation to join Job Portal</h1><br/><p>You have been invited for the job interview for <b>${job.jobTitle}</b> .
              </p>
              <br/>
              <p>To continue with the interview inviation click on the link below ( or paste the link in the browser ) and login with the credentials given below : </p>
              <br/>
              <a href="${frontendUrl}/login" target="_blank">${frontendUrl}/login</a><br/>
              <p><b>Username :</b> ${candidate.Email}</p><br/>
              <p><b>Password</b> ${pass} </p><br/>`;
            await sendGridMail.send({
              to: candidate.Email,
              from: "developervm171@gmail.com",
              subject: `Job Invitation for ${job.jobTitle} - Value Matrix`,
              html: htmltext,
            });
            if (index === candidates.length - 1) {
              // res1.invitations = invitations;
              // await res1.save();
              await Job.findOne(
                { _id: job._id },
                async function (err, user) {
                  console.log(invitations)
                  user.invitations = invitations;
                  await user.save();
                }).clone();
            }
          }
        }
      ).clone();

      jobId = await FindCandidateByEmail(candidate.Email, job_id);
      console.log(jobId);
      // response
      //   .status(200)
      //   .json({ Message: "Invitations Sent", jobId: jobId });
    });
    // }).clone();


    console.log("heelo");

  } catch (err) {
    console.log("Error : ", err);
  }
};
// export const sendJobInvitations = async (request, response) => {
//   try {
//     let job_id = request.body.job_id;
//     let candidates = request.body.candidates;
//     let user_id = request.body.user_id;
//     let jobId = "";
//     let myPromise;
//     await User.findOne({ _id: user_id }, async function (err, res) {
//       console.log("step 1");
//       if (
//         res &&
//         !(res.user_type !== "Company" || res.user_type !== "Company_User")
//       ) {
//         res.status(403).json({ Message: "Not Authorized" });
//       }
// console.log(job_id)

//       await JobBin.findOne({ _id: mongoose.Types.ObjectId(job_id) }, async function (err1, res1) {
//         console.log("step 2");
//         console.log(res1)
//         let invitations = res1.invitations.length > 0 ? res1.invitations : [];
//         await candidates.forEach(async (candidate, index) => {
//           console.log("in the array");
//           await User.findOne(
//             {
//               $or: [
//                 {
//                   email: candidate.Email,
//                 },
//                 {
//                   contact: candidate.Contact,
//                 },
//               ],
//             },

//             async function (error, result) {
//               console.log("callback");
//               if (result) {
//                 if (!result.job_invitations.includes(result._id)) {
//                   let i = result.job_invitations ? result.job_invitations : [];
//                   i.push(job_id);
//                   invitations.push(result._id);
//                   result.job_invitations = i;
//                   await result.save();
//                   await User.findOneAndUpdate(
//                     { _id: result._id },
//                     { job_invitations: i }
//                   );
//                   let noti = new Notification({
//                     forAll: false,
//                     title: "Job Invitation - " + res1.jobTitle,
//                     message:
//                       "You have been invited for the job " +
//                       res1.jobTitle +
//                       " by " +
//                       res.username,
//                     sendTo: [result._id],
//                     type: "Notification",
//                   });
//                   await noti.save();

//                   let html = `<h1>Job Invitation</h1>
//               <br/>
//               <p>
//                 You have been invited for the job <b>${res1.jobTitle}</b> by <b>${res.username}</b>
//               </p><br/>
//               <p>Check out the job invitations at :</p><br/>
//               <a href="${frontendUrl}/user/jobInvitations
//               " target="_blank">${frontendUrl}/user/jobInvitations</a>`;

//                   await sendGridMail.send({
//                     to: result.email,
//                     from: "developervm171@gmail.com",
//                     subject: `Job Invitation by ${res.username} - Value Matrix`,
//                     html: html,
//                   });

//                   if (index === candidates.length - 1) {
//                     res1.invitations = invitations;
//                     await res1.save();
//                   }
//                 }
//               } else {
//                 let id = v4();
//                 let pass = generatePassword();
//                 let reset_pass_id = v4();
//                 let newUser = new User({
//                   username: id,
//                   firstName: candidate.FirstName ? candidate.FirstName : "",
//                   lastName: candidate.LastName ? candidate.LastName : "",
//                   email: candidate.Email,
//                   contact: candidate.Contact,
//                   password: passwordHash.generate(pass),
//                   user_type: "User",
//                   invite: 1,
//                   address: candidate.Address ? candidate.Address : null,
//                   resetPassId: reset_pass_id,
//                   job_invitations: [job_id],
//                   tools: res1.skills ? res1.skills : [],
//                 });
//                 await newUser.save();
//                 invitations.push(newUser._id);
//                 let htmltext = `<h1>Invitation to join Job Portal</h1><br/><p>You have been invited for the job interview for <b>${res1.jobTitle}</b> by <b>${res.username}</b>.
//               </p>
//               <br/>
//               <p>To continue with the interview inviation click on the link below ( or paste the link in the browser ) and login with the credentials given below : </p>
//               <br/>
//               <a href="${frontendUrl}/login" target="_blank">${frontendUrl}/login</a><br/>
//               <p><b>Username :</b> ${candidate.Email}</p><br/>
//               <p><b>Password</b> ${pass} </p><br/>`;
//                 await sendGridMail.send({
//                   to: candidate.Email,
//                   from: "developervm171@gmail.com",
//                   subject: `Job Invitation by ${res.username} - Value Matrix`,
//                   html: htmltext,
//                 });
//                 if (index === candidates.length - 1) {
//                   res1.invitations = invitations;
//                   await res1.save();
//                 }
//               }
//             }
//           ).clone();

//           jobId = await FindCandidateByEmail(candidate.Email, job_id);
//           console.log(jobId);
//           response
//             .status(200)
//             .json({ Message: "Invitations Sent", jobId: jobId });
//         });
//       }).clone();

//       console.log("heelo");
//     }).clone();
//   } catch (err) {
//     console.log("Error : ", err);
//   }
// };

// Approve job
export const approveJob = async (req, res) => {
  try {
    console.log(req.body)
    const jobData = await JobBin.findOne({ _id: req.body._id }).lean();
    console.log(jobData)
    delete jobData._id;
    delete jobData.__v;
    res.send(jobData.__v);
    const newJob = new Job(jobData);
    await newJob.save();

    await Job.findOne(
      { _id: newJob._id },
      async function (err, user) {
        user.status = "Active";
        await user.save();
      }).clone();

    sendJobInvitations(newJob);
    console.log(newJob);

    await JobBin.findOneAndDelete({ _id: req.body._id });
    res.send();
  } catch (err) {
    console.log("Error approveJob: ", err);
    res.send(err);
  }
};
// list of unapproved jobs
export const listOfUnapproveJobs = async (req, res) => {
  try {
    const jobData = await JobBin.find()
    res.send(jobData);
  } catch (err) {
    console.log("Error listOfUnapproveJob: ", err);
    res.send(err);
  }
};

const FindCandidateByEmail = async (email, job_id) => {
  return new Promise((resolve, reject) => {
    let jobId = [];
    Candidate.findOne({ email: email }, async function (err, user) {
      // let id = user.jobId;
      console.log("Step 5");
      if (err) {
        console.log(err);
      }if(user){

      let newJobID;
      if (user.jobId === "" || user.jobId === null) {
        newJobID = job_id;
      } else {
        newJobID = user.jobId.concat(",", job_id);
      }

      user.jobId = newJobID;
      jobId = newJobID;

      console.log(jobId);
      await user.save();
      resolve(jobId);}
    }).clone();
  
  });
};



export const jobStatusChange = async (req, res) => {
  try {
    let statusData = await job.findOneAndUpdate({ _id: req.body.job_id }, { $set: { status: req.body.status } }, { new: true })
    if (statusData.status === req.body.status) {
      res.send({ data: "update successfully" }).status(200);
    } else {
      res.send({ data: "status not updated!" }).status(400);
    }
  }
  catch (err) {
    res.send({ data: "something went wrong", err }).status(400);
  }
}
var ObjectId = mongoose.Types.ObjectId;

export const jobDetailsUploadedByUser = async (req, res) => {
  try {

    const data = await job.aggregate([
      { $match: { uploadBy: ObjectId(req.query.userId) } },
      {
        $lookup: {
          from: "interviewapplications",
          localField: "_id",
          foreignField: "job",
          as: "interviewApplication",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "interviewApplication.applicant",
          foreignField: "_id",
          as: "user",
        },
      },
    ]);
    res.send(data).status(200);
  }
  catch (err) {
    console.log('error in jobDetailsUploadedByUser', err);
    res.send('')
  }
}

export const jobDetailsByJobId = async (req, res) => {
  try {

    const data = await job.aggregate([
      { $match: { _id: ObjectId(req.query.userId) } },
      {
        $lookup: {
          from: "interviewapplications",
          localField: "_id",
          foreignField: "job",
          as: "interviewApplication",
        },
      },
    ]);
    res.send(data).status(200);
  }
  catch (err) {
    console.log(err);
    res.send({ data: "something went wrong", err }).status(400);
  }
}

export const UserDetailsByJobId = async (req, res) => {
  try {

    const data = await job.aggregate([
      { $match: { _id: ObjectId(req.query.userId) } },
      {
        $lookup: {
          from: "interviewapplications",
          localField: "_id",
          foreignField: "job",
          as: "interviewApplication",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "interviewApplication.applicant",
          foreignField: "_id",
          as: "user",
        },
      },
    ]);
    res.send(data).status(200);
  }
  catch (err) {
    console.log('error in jobDetailsByJobId', err);
    res.send('')
  }
}