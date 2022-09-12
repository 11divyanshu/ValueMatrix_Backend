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
    
    try{
        let u_id = request.body.user_id;
        await InterviewApplication.find({applicant : u_id}).sort({updateTime:-1}).exec(async function(err, res){
            if(err){
                return response.status(500).json({message : "Error Occured"});
            }
            else{
                let data = [];
                for(let i=0; i<res.length; i++){
                    let job = await Job.findOne({_id :res[i].job}, function(err,res1){
                        data.push({...res1,...res[i]});
                    }).clone()
                }
                return response.status(200).json({message : "Success", data :data});
            }
        })
    }catch(err){
        return response.status(500).json({Error: err.message});
    }
}