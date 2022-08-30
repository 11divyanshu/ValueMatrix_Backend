import mongoose from "mongoose";
import Job from "../models/jobSchema.js";
import User from "../models/userSchema.js";
import Notification from "../models/notificationSchema.js";
import {} from "dotenv/config.js";
import fs from "fs";
import passwordHash from "password-hash";
import json2xls from "json2xls";
import v4 from "uuid/v4.js";
import sendGridMail from "@sendgrid/mail";
import axios from "axios";

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

      let jobC = {
        jobTitle: request.body.jobTitle,
        jobDesc: request.body.jobDesc,
        uploadBy: res.id,
        location: request.body.location,
        jobType: request.body.jobType,
        validTill: request.body.validTill ? request.body.validTill : null,
        hiringOrganization: request.body.hiringOrganization,
        salary: request.body.salary ? request.body.salary : null,
        perks: request.body.perks ? request.body.perks : null,
        eligibility: request.body.eligibility ? request.body.eligibility : null,
        skills: request.body.skills ? request.body.skills : null,
      };

      const newJob = new Job(jobC);
      await newJob.save();
      console.log("D");
      if (newJob) {
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
    await Job.find({})
      .sort({ createTime: -1 })
      .exec(async function (err, res) {
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
    // user1 = request;
    // if (request === undefined || request === null) {
    //   response.status(403);
    //   return;
    // }
    await User.findOne({ _id: request.body.user_id }, function (err, res) {});
    let job = Job.findOne({ _id: request.body.job_id });
    // if (job.uploadBy !== user1) {
    //   response.status(403);
    //   return;
    // }
    let newJob = Job.findOneAndUpdate(
      { _id: request.body.job_id },
      request.body.updates
    );
    response.status(200).json({ job: newJob });
  } catch (error) {
    console.log("Error : ", error);
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
      //   fs.unlink(filename, (err) => {
      //     if (err) {
      //       console.log("Error deleting file : ", err);
      //     }
      //   });

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
          //   fs.unlink(filename, (err) => {
          //     if (err) {
          //       console.log("Error deleting file : ", err);
          //     }
          //   });
        }
      });
    });
    response.status(200).json({ Message: "Files Downloaded" });
  } catch (error) {}
};

// Get Job From Id
export const GetJobFromId = async (request, response) => {
  try {
    await Job.findOne({ _id: request.body.job_id }, function (err, res) {
      if (res) response.status(200).json({ job: res });
    });
  } catch (error) {}
};

// Send Invitations To Users
export const sendJobInvitations = async (request, response) => {
  try {
    console.log(request.body);
    let job_id = request.body.job_id;
    let candidates = request.body.candidates;
    let user_id = request.body.user_id;
    await User.findOne({ _id: user_id }, async function (err, res) {
      if (
        res &&
        !(res.user_type !== "Comapny" || res.user_type !== "Company_User")
      ) {
        res.status(403).json({ Message: "Not Authorized" });
      }
      await Job.findOne({ _id: job_id }, async function (err1, res1) {
        let invitations = [];
        candidates.forEach((candidate) => {
          User.findOne(
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
              if (result) {
                let i = result.job_invitions ? result.job_invitations : [];
                i.push(job_id);
                invitations.push(result._id);
                await User.findOneAndUpdate(
                  { _id: result._id },
                  { job_invitations: i }
                );
                let noti = new Notification({
                  forAll: false,
                  title: "Job Invitation - " + res1.jobTitle,
                  message:
                    "You have been invited for the job " +
                    res1.jobTitle +
                    " by " +
                    res.username,
                  sendTo: [result._id],
                  type: "Notification",
                });
                await noti.save();

                let html = `<h1>Job Invitation</h1>
              <br/>
              <p>
                You have been invited for the job <b>${res1.jobTitle}</b> by <b>${res.username}</b>
              </p><br/>
              <p>Check out the job invitations at :</p><br/>
              <a href="${frontendUrl}/user/jobInvitations
              " target="_blank">${frontendUrl}/user/jobInvitations</a>`;

                await sendGridMail.send({
                  to: result.email,
                  from: "developervm171@gmail.com",
                  subject: `Job Invitation by ${res.username} - Value Matrix`,
                  html: html,
                });
                console.log("Email sent to : ", result.email);
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
                });
                await newUser.save();
                invitations.push(newUser._id);
                let htmltext = `<h1>Invitation to join Job Portal</h1><br/><p>You have been invited for the job interview for <b>${res1.jobTitle}</b> by <b>${res.username}</b>.
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
                  subject: `Job Invitation by ${res.username} - Value Matrix`,
                  html: htmltext,
                });
                console.log("Email sent to : ", candidate.Email);
              }
            }
          ).clone();
        });
        res1.invitations = invitations;
        await res1.save();
      }).clone();
    }).clone();
  } catch (err) {
    console.log("Error : ", err);
  }
};
