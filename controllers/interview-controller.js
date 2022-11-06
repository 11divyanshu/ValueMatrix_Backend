import mongoose from "mongoose";
import { } from "dotenv/config.js";
import fs from "fs";
import sendGridMail from "@sendgrid/mail";
import axios from "axios";
import interview from "../models/interviewApplicationSchema.js";
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
              interviewStatus: interviewDetails.interviewStatus
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
            interviewStatus: interviewDetails.interviewStatus
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
                interviewStatus: interviewDetails.interviewStatus
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
      let updatedinterview = await interview.findOneAndUpdate({ _id: request.body.meetingID }, { $set: { firstEmotion: request.body.data, faceTest: true } }, { new: true });
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
  }catch{
    response.send({ data: "something went wrong", err }).status(400);
  }
}

export const nullallchecks = async (request, response, next)=>{
  try{
    let initcheck = await interview.findOneAndUpdate({ _id: request.body.meetingID }, { $set: { firstEmotion: null, faceTest: false, gazeTest: false, personTest: false, earTest: false } });
    return next();
  }catch{
    response.send({ data: "something went wrong", err }).status(400);
  }
}