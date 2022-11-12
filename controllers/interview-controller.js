import mongoose from "mongoose";
import { } from "dotenv/config.js";
import fs from "fs";
import sendGridMail from "@sendgrid/mail";
import axios from "axios";
import interview from "../models/interviewApplicationSchema.js";
import interviewQuestion from "../models/interviewQuestionSchema.js";
import Job from "../models/jobSchema.js";
import { job } from "cron";

const url = process.env.BACKEND_URL;
const frontendUrl = process.env.FRONTEND_URL;
const orgid = process.env.ORGID;
const apikey = process.env.DYTEAPIKEY;

sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

export const getinterviewdetails = async (request, response) => {
  try {
    let interviewDetails = await interview.findById(request.body.meetingID);
    response.send({
      data: "Data Fetched",
      meetingID: interviewDetails.meetingID,
      meetingRoom: interviewDetails.meetingRoom,
      faceTest: interviewDetails.faceTest,
      gazeTest: interviewDetails.gazeTest,
      personTest: interviewDetails.personTest,
      earTest: interviewDetails.earTest,
      interviewStatus: interviewDetails.interviewStatus
    }).status(200);
  }
  catch (err) {
    response.send({ data: "something went wrong", err }).status(400);
  }
};

export const checkinterviewdetails = async (request, response) => {
  try {
    // console.log(request.body);
    let interviewDetails = await interview.findById(request.body.meetingID);
    if(interviewDetails.meetingID === null){
      axios.post("https://api.cluster.dyte.in/v1/organizations/"+orgid+"/meeting",{
        "title": "Value Matrix Interview Room #"+request.body.meetingID,
        "authorization":{
            "waitingRoom":false
        }
      },{headers:{Authorization: apikey}}).then(async (rspns)=>{
        var meetingdata = rspns.data.data.meeting;
        let interviewDetails = await interview.findOneAndUpdate({ _id: request.body.meetingID }, { $set: { meetingID: meetingdata.id, meetingRoom: meetingdata.roomName } }, { new: true });
        if(interviewDetails.interviewers[i] === request.body.participant._id){
          axios.post("https://api.cluster.dyte.in/v1/organizations/"+orgid+"/meetings/"+interviewDetails.meetingID+"/participant",{
            "clientSpecificId": request.body.participant._id,
            "userDetails": {
              "name": request.body.participant.firstName,
              "picture": `${url}/media/profileImg/${request.body.participant.profileImg}`
            },
          },{headers:{Authorization: apikey}}).then((userresponse)=>{
            var userAuthToken = userresponse.data.data.authResponse.authToken;
            response.send({
              data: "Data Retrieved",
              meetingID: interviewDetails.meetingID,
              meetingRoom: interviewDetails.meetingRoom,
              authToken: userAuthToken,
              faceTest: interviewDetails.faceTest,
              gazeTest: interviewDetails.gazeTest,
              personTest: interviewDetails.personTest,
              earTest: interviewDetails.earTest,
              interviewStatus: interviewDetails.interviewStatus,
              jobid: interviewDetails.job.toString()
            }).status(200);
            // console.log(userAuthToken);
          });
        }
      });
    }else{
      if(JSON.stringify(interviewDetails.applicant) === '"'+request.body.participant._id+'"'){
        axios.post("https://api.cluster.dyte.in/v1/organizations/"+orgid+"/meetings/"+interviewDetails.meetingID+"/participant",{
          "clientSpecificId": request.body.participant._id,
          "userDetails": {
            "name": request.body.participant.firstName,
            "picture": `${url}/media/profileImg/${request.body.participant.profileImg}`
          },
        },{headers:{Authorization: apikey}}).then((userresponse)=>{
          var userAuthToken = userresponse.data.data.authResponse.authToken;
          response.send({
            data: "Data Retrieved",
            meetingID: interviewDetails.meetingID,
            meetingRoom: interviewDetails.meetingRoom,
            authToken: userAuthToken,
            faceTest: interviewDetails.faceTest,
            gazeTest: interviewDetails.gazeTest,
            personTest: interviewDetails.personTest,
            earTest: interviewDetails.earTest,
            interviewStatus: interviewDetails.interviewStatus,
            jobid: interviewDetails.job.toString()
          }).status(200);
          // console.log(userAuthToken);
        });
      }else{
        for(var i=0;i<interviewDetails.interviewers.length;i++){
          if(interviewDetails.interviewers[i] === request.body.participant._id){
            axios.post("https://api.cluster.dyte.in/v1/organizations/"+orgid+"/meetings/"+interviewDetails.meetingID+"/participant",{
              "clientSpecificId": request.body.participant._id,
              "userDetails": {
                "name": request.body.participant.firstName,
                "picture": `${url}/media/profileImg/${request.body.participant.profileImg}`
              },
            },{headers:{Authorization: apikey}}).then((userresponse)=>{
              var userAuthToken = userresponse.data.data.authResponse.authToken;
              response.send({
                data: "Data Retrieved",
                meetingID: interviewDetails.meetingID,
                meetingRoom: interviewDetails.meetingRoom,
                authToken: userAuthToken,
                faceTest: interviewDetails.faceTest,
                gazeTest: interviewDetails.gazeTest,
                personTest: interviewDetails.personTest,
                earTest: interviewDetails.earTest,
                interviewStatus: interviewDetails.interviewStatus,
                jobid: interviewDetails.job.toString()
              }).status(200);
              // console.log(userAuthToken);
            });
          }
          if(i == interviewDetails.interviewers.length-1 && interviewDetails.interviewers[i] != request.body.participant._id){
            response.send({
              data: "Not Authorized"
            }).status(200);
          }
        }
      }
    }
  }
  catch (err) {
    response.send({ data: "something went wrong", err }).status(400);
  }
};

export const updateinterviewcheck = async (request, response)=>{
  try{
    if(request.body.type === "face"){
      let updatedinterview = await interview.findOneAndUpdate({ _id: request.body.meetingID }, { $set: { faceTest: true } }, { new: true });
      response.send({
        data: "Updated Test",
        updatedinterview: updatedinterview
      }).status(200);
    }else if(request.body.type === "gaze"){
      let updatedinterview = await interview.findOneAndUpdate({ _id: request.body.meetingID }, { $set: { gazeTest: true } }, { new: true });
      response.send({
        data: "Updated Test",
        updatedinterview: updatedinterview
      }).status(200);
    }else if(request.body.type === "person"){
      let updatedinterview = await interview.findOneAndUpdate({ _id: request.body.meetingID }, { $set: { personTest: true } }, { new: true });
      response.send({
        data: "Updated Test",
        updatedinterview: updatedinterview
      }).status(200);
    }else if(request.body.type === "ear"){
      let updatedinterview = await interview.findOneAndUpdate({ _id: request.body.meetingID }, { $set: { earTest: true } }, { new: true });
      response.send({
        data: "Updated Test",
        updatedinterview: updatedinterview
      }).status(200);
    }
  }catch(err){
    response.send({ data: "something went wrong", err }).status(400);
  }
}

export const updatelivestatus = async (request, response)=>{
  try{
    let updatedinterview = await interview.findOneAndUpdate({ _id: request.body.meetingID }, { $set: { livestats: request.body.stats } }, { new: true });
    response.send({
      data: "Updated Stats",
    }).status(200);
  }catch(err){
    response.send({ data: "something went wrong", err }).status(400);
  }
}

export const startinterview = async (request, response)=>{
  try{
    let updatedinterviewstatus = await interview.findOneAndUpdate({ _id: request.body.meetingID }, { $set: { interviewStatus: true } }, { new: true });
    response.send({
      data: "Interview Started",
    }).status(200);
  }catch(err){
    response.send({ data: "something went wrong", err }).status(400);
  }
}

export const endinterview = async (request, response)=>{
  try{
    let updatedinterviewstatus = await interview.findOneAndUpdate({ _id: request.body.meetingID }, { $set: { interviewStatus: false } }, { new: true });
    response.send({
      data: "Interview Completed",
    }).status(200);
  }catch(err){
    response.send({ data: "something went wrong", err }).status(400);
  }
}

export const setquestionresult = async (request, response)=>{
  try{
    let interviewDetails = await interview.findById(request.body.meetingID);
    let newset = [...interviewDetails.generalQuestions, request.body.qn]
    let updatedinterviewstatus = await interview.findOneAndUpdate({ _id: request.body.meetingID }, { $set: { generalQuestions: newset } }, { new: true });
    response.send({
      data: "Interview Completed",
    }).status(200);
  }catch(err){
    response.send({ data: "something went wrong", err }).status(400);
  }
}

export const savecode = async (request, response)=>{
  try{
    let updatedcode = await interview.findOneAndUpdate({ _id: request.body.meetingID }, { $set: { codearea: request.body.code, codestdin: request.body.stdin, codestdout: request.body.stdout } }, { new: true });
    response.send({
      data: "Updated Code",
      newstats: updatedcode
    }).status(200);
  }catch(err){
    response.send({ data: "something went wrong", err }).status(400);
  }
}

export const getlivestatus = async (request, response)=>{
  try{
    let livestatus = await interview.findById(request.body.meetingID);
    response.send({
      data: "Data Retrieved",
      stats: livestatus
    }).status(200);
  }catch(err){
    response.send({ data: "something went wrong", err }).status(400);
  }
}

export const nullallchecks = async (request, response, next)=>{
  try{
    let initcheck = await interview.findOneAndUpdate({ _id: request.body.meetingID }, { $set: { faceTest: false, gazeTest: false, personTest: false, earTest: false } });
    return next();
  }catch{
    response.send({ data: "something went wrong", err }).status(400);
  }
}

export const compilecode = async (request, response)=>{
  try{
    console.log(request.body.data);
    const options = {
      method: "POST",
      url: process.env.REACT_APP_RAPID_API_URL,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Host": process.env.REACT_APP_RAPID_API_HOST,
        "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
      },
      data: request.body.data,
    };

    console.log("options");

    axios
      .request(options)
      .then(function (rspns) {
        const token = rspns.data.token;
        response.send({
          data : "Token Generated",
          token: token
        }).status(200);
      })
      .catch((err) => {
        let error = err.response ? err.response.data : err;
        console.log(error);
        response.send({
          data: "Error",
          error: error
        }).status(400);
      });
  }catch{
    response.send({ data: "something went wrong" }).status(400);
  }
}

export const checkcompilestatus = async (request, response)=>{
  try {
    const options = {
      method: "GET",
      url: process.env.REACT_APP_RAPID_API_URL + "/" + request.body.token,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "X-RapidAPI-Host": process.env.REACT_APP_RAPID_API_HOST,
        "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
      },
    };

    do{
      let rsppnnss = await axios.request(options);
      response.send({
        data: "Compilation Report",
        rsp: rsppnnss.data
      }).status(200);
    }while(statusId != 1 && statusId != 2);
  } catch (err) {
    response.send({ data: "something went wrong", err }).status(400);
  }
}

export const xiquestions = async (request, response)=>{
  try {
    interviewQuestion.findOne({ type: request.body.type, level: request.body.level, experience: request.body.experience, category: request.body.category }, async function (err, res) {
      if (err) {
        return response.send().status(400);
      } else {
        if(request.body.type === "Problem Statement"){
          let setproblemstm = await interview.findOneAndUpdate({ _id: request.body.meetingID }, { $set: { codequestion: res.question } });
        }
        return response
          .status(200)
          .json({ ques: res });
      }
    })
  } catch (err) {
    response.send({ data: "something went wrong", err }).status(400);
  }
}

export const getinterviewjob = async (request, response)=>{
  try {
    console.log(request.body);
    let crntjob = await Job.findById(request.body.jobid);
    Job.findOne({}, function (err, res) {
      if (err) {
        return response.send().status(400);
      } else {
        return response
          .status(200)
          .json({ job: crntjob });
      }
    }).clone()
  } catch (err) {
    response.send({ data: "something went wrong", err }).status(400);
  }
}