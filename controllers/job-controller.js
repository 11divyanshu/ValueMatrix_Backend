import mongoose from "mongoose";
import Job from "../models/jobSchema.js";
import User from "../models/userSchema.js";
import {} from 'dotenv/config.js';

export const addJob = async(request, response) => {
    try {
        console.log(request.body);
        User.findOne({_id : request.body.user_id}, async function(err,res){
            if(res === null || res === undefined || res.isAdmin === false){
                response.status(404).json({"Message":"Admin Not Found"}); return;
            }
            let jobC = {
                jobTitle: request.body.jobTitle,
                jobDesc : request.body.jobDesc,
                uploadBy: res,
                location : request.body.location,
                jobType: request.body.jobType,
                validTill: request.body.validTill? request.body.validTill:null,
                hiringOrganization : request.body.hiringOrganization,
                basicSalary: request.body.basicSalary ? request.body.basicSalary: null
            };
            const newJob = new Job(jobC);
            await newJob.save();
            if(newJob){
                response.status(200).json({"Message":"Job Added Successfully", "job": newJob});
                return;
            }
            else{
                response.status(401).json({"Message":"Error Adding Job"});
                return;
            }
        })
    } catch (error) {
        console.log("Error : ", error);
    }
}


// List Jobs
export const listJobs = async(request,response) => {
    try {
        await Job.find({}).sort({createTime : -1}).exec(async function(err,res){
            await response.status(200).json({"jobs":res});
            return;
        })
    } catch (error) {
        console.log(error);
    }
}