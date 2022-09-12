import mongoose from "mongoose";
import Job from "../models/jobSchema.js";
import User from "../models/userSchema.js";
import Notification from "../models/notificationSchema.js";
import InterviewApplication from "../models/interviewApplicationSchema.js";
import { } from "dotenv/config.js";
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
        await InterviewApplication.find({ applicant: u_id }).sort({ updateTime: -1 }).exec(async function (err, res) {
            if (err) {
                return response.status(500).json({ message: "Error Occured" });
            }
            else {
                let job = await Job.findOne({ _id: res.job }).select({ jobTitle: 1, hiringOrgainzation: 1, });
                return response.status(200).json({ message: "Success", data: res, job: job });
            }
        })
    } catch (err) {
        return response.status(500).json({ Error: err.message });
    }
}
export const getXIEvaluationList = async (request, response) => {

    try {
        // console.log(request);
        let u_id = request.body.user_id;
        console.log(u_id);
        let jobs = [];

        await InterviewApplication.find({ interviewers: { $in: mongoose.Types.ObjectId(u_id) } }).exec(async function (err, res) {
            if (err) {
                // console.log(err);
                return response.status(500).json({ message: "Error Occured" });
            }
            else {

                // console.log(res);
                await res.forEach((item, index) => {
                    //  console.log(item.job);
                    Job.findOne({ _id: item.job }, async function (err, result) {

                        await jobs.push(result);
                        console.log(jobs);

                    });
                    //  console.log(job);

                })
                setTimeout(() => {
                    return response.status(200).json({jobs});
                   
                }, 1000);
            }
        })
    } catch (err) {
        return response.status(500).json({ Error: err.message });
    }
}


