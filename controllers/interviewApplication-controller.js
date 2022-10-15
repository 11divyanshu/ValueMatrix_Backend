import mongoose from "mongoose";
import Job from "../models/jobSchema.js";
import User from "../models/userSchema.js";
import Notification from "../models/notificationSchema.js";
import InterviewApplication from "../models/interviewApplicationSchema.js";
import {} from "dotenv/config.js";
import fs from "fs";
import passwordHash from "password-hash";
import json2xls from "json2xls";
import v4 from "uuid/v4.js";
import axios from "axios";

const url = process.env.BACKEND_URL;
const frontendUrl = process.env.FRONTEND_URL;

// Get List of User Applications
export const getUserInterviewApplications = async (request, response) => {
  try {
    let u_id = request.body.user_id;
    await InterviewApplication.find({ applicant: u_id })
      .sort({ updateTime: -1 })
      .exec(async function (err, res) {
        if (err) {
          return response.status(500).json({ message: "Error Occured" });
        } else {
          // let job = await Job.findOne({ _id: res.job }).select({ jobTitle: 1, hiringOrgainzation: 1, });
          // return response.status(200).json({ message: "Success", data: res, job: job });
          let data = [];
          for (let i = 0; i < res.length; i++) {
            let job = await Job.findOne(
              { _id: res[i].job },
              function (err, res1) {
                data.push({ ...res1, ...res[i] });
              }
            ).clone();
          }
          return response.status(200).json({ message: "Success", data: data });
        }
      });
  } catch (err) {
    return response.status(500).json({ Error: err.message });
  }
};

export const getXIEvaluationList = async (request, response) => {
  try {
    // console.log(request);
    let u_id = request.body.user_id;
    console.log(u_id);
    let jobs = [];
    let data = await InterviewApplication.aggregate([
      { $match: { interviewers: { $in: [u_id] } } },
      {
        $lookup: {
          from: "jobs",
          localField: "job",
          foreignField: "_id",
          as: "job",
        },
      },
      {
        $lookup: {
          from: "slots",
          localField: "_id",
          foreignField: "interviewId",
          as: "slots",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "applicant",
          foreignField: "_id",
          as: "applicant",
        },
      },
     
      
    ]);
console.log(data)
    response.send(data)
    // await InterviewApplication.find({
    //   interviewers: { $in: mongoose.Types.ObjectId(u_id) },
    // }).exec(async function (err, res) {
    //   if (err) {
    //     // console.log(err);
    //     return response.status(500).json({ message: "Error Occured" });
    //   } else {
    //     // console.log(res);
    //     await res.forEach(async (item, index) => {
    //       let r = { application: item };
    //       await Job.findOne({ _id: item.job }, async function (err, result) {
    //         r.job = {
    //           _id: result._id,
    //           jobTitle: result.jobTitle,
    //           hiringOrganization: result.hiringOrganization,
    //           jobLocation: result.jobLocation,
    //           jobDescription: result.jobDescription,
    //           jobType: result.jobType,
    //         };

    //        await User.findOne(
    //           { _id: item.applicant },
    //           async function (err, result) {
    //             r.applicant = {
    //               _id: result._id,
    //               firstName: result.firstName,
    //               lastname: result.lastname,
    //               contact: result.contact,
    //               email: result.email,
    //               username: result.username,
    //             };
    //           }
    //         ).clone();
    //       }).clone();

    //       // console.log(r);
    //       jobs.push(r);
    //     });
    //     setTimeout(() => {
    //       return response.status(200).json({ jobs });
    //     }, 2000);
    //   }
    // });
  } catch (err) {
    return response.status(500).json({ Error: err.message });
  }
};

export const getXIEvaluatedReports = async (request, response) => {
  try {
    // console.log(request);
    let u_id = request.body.user_id;
    // console.log(typeof(u_id));

    let jobs = [];

    await InterviewApplication.find({
      interviewers: { $in: mongoose.Types.ObjectId(u_id) },
    }).exec(async function (err, res) {
      if (err) {
        // console.log(err);
        return response.status(500).json({ message: "Error Occured" });
      } else {
        await res.forEach(async (item, index) => {
          if (item.evaluations[u_id]) {
            let r = { application: item };
            await Job.findOne({ _id: item.job }, async function (err, result) {
              r.job = {
                _id: result._id,
                jobTitle: result.jobTitle,
                hiringOrganization: result.hiringOrganization,
                jobLocation: result.jobLocation,
                jobDescription: result.jobDescription,
                jobType: result.jobType,
              };

              await User.findOne(
                { _id: item.applicant },
                async function (err, result) {
                  r.applicant = {
                    _id: result._id,
                    firstName: result.firstName,
                    lastname: result.lastname,
                    contact: result.contact,
                    email: result.email,
                    username: result.username,
                  };
                }
              ).clone();
            }).clone();

            jobs.push(r);
            // console.log(jobs);
            //   }
          }
        });

        if (jobs) {
          setTimeout(() => {
            return response.status(200).json({ jobs });
          }, 2000);
        }
      }
    });
  } catch (err) {
    return response.status(500).json({ Error: err.message });
  }
};

export const getInterviewApplication = async (request, response) => {
  try {
    let id = request.body.id;
    
    console.log(request.body);
    await InterviewApplication.findOne({ _id: mongoose.Types.ObjectId(id) }).exec(async function (
      err,
      res
    ) {
      console.log(res)
      if (err) {
        return response.status(500).json({ message: "Error Occured" });
      } else {
        let data = { application: res };
        await Job.findOne({ _id: res.job }, function (err, result) {
          data.job = {
            _id: result._id,
            jobTitle: result.jobTitle,
            hiringOrganization: result.hiringOrganization,
            location: result.location,
            Description: result.jobDescription,
            jobType: result.jobType,
            salary: result.salary,
            questions: result.questions,
          };
        }).clone();

        while (data.applicant == undefined) {
          await User.findOne({ _id: res.applicant }, function (err, result) {
            data.applicant = {
              _id: result._id,
              firstName: result.firstName,
              lastname: result.lastname,
              contact: result.contact,
              email: result.email,
              username: result.username,
            };
          }).clone();

          // console.log(data);

        }

        return response.status(200).json({ message: "Success", data: data });
      }
    });
  } catch (error) {
    return response.status(500).json(error.message);
  }
};
export const getCandidateEvaluation = async (request, response) => {
  try {
    let id = request.body.id;
    //console.log(request.body);
    await InterviewApplication.findOne({ applicant: id }).exec(async function (
      err,
      res
    ) {
      if (err) {
        return response.status(500).json({ message: "Error Occured" });
      } else {
        // let data = { application: res };

        let j = res.evaluations;
        let data = [];
        if (j) {
          // console.log(Object.entries(j));

          let eva = Object.entries(j);
          for (var i = 0; i < eva.length; i++) {
            await User.findOne({ _id: eva[i][0] }, function (err, result) {
              let applicant = {
                _id: result._id,
                firstName: result.firstName,
                lastname: result.lastname,
                contact: result.contact,
                email: result.email,
                username: result.username,
                evaluations: eva[i] ? eva[i][1] : null,
                job: res._id,
              };
              // console.log(applicant);
              data.push(applicant);
            }).clone();
          }
        }

        return response.status(200).json({ message: "Success", data: data });
      }
    });
  } catch (error) {
    return response.status(500).json(error.message);
  }
};

export const updateEvaluation = async (request, response) => {
  try {
    //console.log(request.body);
    let updates = request.body.updates;
    let xi_id = request.body.user_id;
    await InterviewApplication.findOne(
      { _id: request.body.application_id },
      async function (err, res) {
        if (res && res.evaluations && res.evaluations[xi_id]) {
          // console.log(res);
          let r = res.evaluations[xi_id];
          if (updates.candidate_rating) {
            r.candidate_rating = updates.candidate_rating;
          }
          if (updates.feedback) {
            r.feedback = updates.feedback;
          }
          if (updates.concern) {
            r.concern = updates.concern;
          }
          if (updates.status) {
            r.status = updates.status;
          }
          if (updates.questions) {
            r.questions = updates.questions;
          }
          if (updates.skills) {
            r.skills = updates.skills;
          }
          // console.log(r.skills);
          let tempEv = res.evaluations;
          tempEv[xi_id] = r;
          // console.log(tempEv);
          let tempSkills = [];
          e;

          User.findById(res.applicant, async function (err, user) {
            tempSkills = user.tools;
            r.skills.map((item) => {
              let status = false;

              user.tools.map((skills, index) => {
                // console.log(index);
                if (skills._id == item._id) {
                  user.tools[index].lastEvaluated = item.proficiency;
                  //console.log(user.tools);
                  status = true;
                }
              });

              if (status === false) {
                user.tools.push(item);
              }
            });

            // console.log(user);
            user.markModified("tools");
            await user.save();
          });

          // User.findByIdAndUpdate(res.applicant , {
          //   $set: {
          //     tools: tempSkills
          //   }}, function (err, doc) {
          //     // console.log(doc);
          //   }).clone();

          InterviewApplication.findByIdAndUpdate(
            request.body.application_id,
            {
              $set: {
                evaluations: tempEv,
              },
            },
            function (err, doc) {
              // console.log(doc);
            }
          );
          res.evaluations = tempEv;
          await res.save();
          return response
            .status(200)
            .json({ message: "Success", evaluations: res.evaluations[xi_id] });
        } else {
          let r = {};
          r.candidate_rating = updates.candidate_rating
            ? updates.candidate_rating
            : 0;
          r.feedback = updates.feedback ? updates.feedback : "";
          r.concern = updates.concern ? updates.concern : "";
          r.status = updates.status ? updates.status : "Pending";
          r.questions = updates.questions ? updates.questions : [];
          r.skills = updates.skills ? updates.skills : [];
          if (!res && !res.evaluations) res.evaluations = {};
          res.evaluations[xi_id] = r;
          await res.save();
          return response
            .status(200)
            .json({ message: "Success", evaluations: r });
        }
      }
    ).clone();
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
};

export const updateInterviewApplication = async (req, res) => {
  try {
    let id = req.query.id;

    let data = await InterviewApplication.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(id) },
      req.body
    );
    if (data) {
      res.send().status(200);
    } else {
      res.send({ data: "Updatation failed" }).status(400);
    }
  } catch (err) {
    console.log("error in updateInterviewApplication", err);
    res.send(err).status(400);
  }
};

import job from "../models/jobSchema.js";
import interviewApplication from "../models/interviewApplicationSchema.js";

var ObjectId = mongoose.Types.ObjectId;

export const interviewApplicationStatusChange = async (req, res) => {
  try {
    if (
      (req.body.status === "On Hold" ||
        req.body.status === "Assigned" ||
        req.body.status === "Rejected") &&
      !req.body.isCompany
    ) {
      return res.status(400).send("Only company can update given status");
    }

    if (req.body.status === "Accepted") {
      const data = await interviewApplication.aggregate([
        { $match: { _id: ObjectId(req.body._id) } },
        {
          $lookup: {
            from: "jobs",
            localField: "job",
            foreignField: "_id",
            as: "jobs",
          },
        },
      ]);
      console.log(data[0].jobs[0].status);

      if (
        data[0].jobs[0].status === "Closed" ||
        data[0].jobs[0].status === "Archieve" ||
        data[0].jobs[0].status === "Not Accepting"
      ) {
        return res
          .status(400)
          .send("This job is no longer accepting applications");
      }
    }

    const data = await interviewApplication.findByIdAndUpdate(
      { _id: ObjectId(req.body._id) },
      { $set: { status: req.body.status } },
      { new: true }
    );
    res.status(200).send("updated successfully");
  } catch (err) {
    res.status(400).send("something went wrong");
  }
};
// export const updateSkills = async (request,response)=>{
//   try {
//   console.log(request.body);
//     let user1 = await InterviewApplication.findOne(
//       { applicant: request.body.user_id },async function(err,user){

//       user.tools = request.body.updates.tools;
//         await user.save();
//         console.log(user);
//       }
//     );
//     response.status(200).json({user: user1});
//   } catch (error) {
//     console.log(error);
//   }
// }
