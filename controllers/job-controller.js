import mongoose from "mongoose";
import Job from "../models/jobSchema.js";
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
      //console.log(request.body);
      if (res === null || res === undefined) {
        response.status(404).json({ Message: "Admin Not Found" });
        return;
      }
      //console.log(request.body.skills);
      let jobC = {
        jobTitle: request.body.jobTitle,
        jobDesc: request.body.jobDesc,
        uploadBy: res.id,
        location: request.body.location,
        jobType: request.body.jobType,
        reqApp: request.body.reqApp,
        validTill: request.body.validTill ? request.body.validTill : null,
        hiringOrganization: request.body.hiringOrganization,
        salary: request.body.salary ? request.body.salary : null,
        perks: request.body.perks ? request.body.perks : null,
        eligibility: request.body.eligibility ? request.body.eligibility : null,
        skills: request.body.skills ? request.body.skills : null,
        questions: request.body.questions ? request.body.questions : [],
        archived: false,
      };
      // console.log(jobC);
      const newJob = new Job(jobC);
      await newJob.save();
      // console.log("D");
      if (newJob) {
        let candidateList = request.body.candidateList.map((a) => a.email);
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
        user.hiringOrganization = request.body.hiringOrganization;
        user.eligibility = request.body.eligibility;
        user.perks = request.body.perks;
        user.salary = request.body.salary;
        user.skills = request.body.skills;
        user.questions = request.body.questions;
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
    // console.log(request.body)
    let newJob = await Job.findOne(
      { _id: request.body._id },
      async function (err, user) {
        // console.log(user);
        user.archived = request.body.archived;
        await user.save();
        return response.status(200).json({ Success: true });
      }
    ).clone();
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
export const sendJobInvitations = async (request, response) => {
  try {
    let job_id = request.body.job_id;
    let candidates = request.body.candidates;
    let user_id = request.body.user_id;
    await User.findOne({ _id: user_id }, async function (err, res) {
      if (
        res &&
        !(res.user_type !== "Company" || res.user_type !== "Company_User")

      ) {
        res.status(403).json({ Message: "Not Authorized" });
      }
      await Job.findOne({ _id: job_id }, async function (err1, res1) {
        let invitations = res1.invitations ? res1.invitations : [];
        await candidates.forEach((candidate, index) => {
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
                if (!result.job_invitations.includes(result._id)) {
                  let i = result.job_invitations ? result.job_invitations : [];
                  i.push(job_id);
                  invitations.push(result._id);
                  result.job_invitations = i;
                  await result.save();
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

                  if (index === candidates.length - 1) {
                    res1.invitations = invitations;
                    await res1.save();
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
                  tools: res1.skills ? res1.skills : [],
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
                if (index === candidates.length - 1) {
                  res1.invitations = invitations;
                  await res1.save();
                }
              }
            }
          ).clone();

          Candidate.findOne({ email: candidate.Email }, async function (user, response) {
            // let id = user.jobId;
            console.log(candidate.Email)

            console.log(user)
            // let newJobID = user.jobId + ","+job_id;

            // user.jobId = newJobID;
            // await user.save();
          }).clone();
        })
      }).clone();
    }).clone();
    return response.status(200).json({ Message: "Invitations Sent" });
  } catch (err) {
    console.log("Error : ", err);
  }
};
