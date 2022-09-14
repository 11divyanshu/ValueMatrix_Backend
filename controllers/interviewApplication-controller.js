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

    await InterviewApplication.find({
      interviewers: { $in: mongoose.Types.ObjectId(u_id) },
    }).exec(async function (err, res) {
      if (err) {
        // console.log(err);
        return response.status(500).json({ message: "Error Occured" });
      } else {
        // console.log(res);
        await res.forEach(async (item, index) => {
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
          }).clone();
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
          console.log(r);
          jobs.push(r);
        });
        setTimeout(() => {
          return response.status(200).json({ jobs });
        }, 1000);
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
    await InterviewApplication.findOne({ _id: id }).exec(async function (
      err,
      res
    ) {
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
            questions : result.questions,
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
        }
        return response.status(200).json({ message: "Success", data: data });
      }
    });
  } catch (error) {
    return response.status(500).json(error.message);
  }
};
