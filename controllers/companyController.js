import User from "../models/userSchema.js";
import axios from "axios";
import passwordHash from "password-hash";
import {} from "dotenv/config";
import multer from "multer";
import fs from "fs";
import sendGridMail from "@sendgrid/mail";
import FormData from "form-data";
import path from "path";
import job from "../models/jobSchema.js";
import { response } from "express";

const url = process.env.BACKEND_URL;
const front_url = process.env.FRONTEND_URL;
sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);




export const addCompanyUser = async (request, response) => {
  try {
    if (
      request.body.company_id === null ||
      request.body.company_id === undefined
    ) {
      return response.json({
        success: false,
        message: "Company id is required",
      });
    }
    await User.findOne({ _id: request.body.company_id }, function (err, res) {
      if (err) {
        console.log(err);
        return response.status(401).json("Request User Not Found");
      }
      if (res && res.user_type !== "Company") {
        return response
          .status(401)
          .json("Request User Not Registered as a Company");
        return;
      }
    }).clone();
    let user = await User.findOne({ email: request.body.email });
    if (user) {
      return response.json({
        message: "User already exists",
      });
      return;
    }
    if (user == null) {
      user = await User.findOne({ username: request.body.username });
      if (user) {
        return response.json({
          message: "Username already exists",
        });
        return;
      }
    }
    if (user == null) {
      user = await User.findOne({ contact: request.body.contact });
      if (user) {
        return response.json({
          message: "Contact already exists",
        });
        return;
      }
    }
    let permission = {};
    request.body.permission.forEach((i) => {
      permission[i.id] = i.value;
    });
    //console.log(permission);
    let newUser = new User({
      email: request.body.email,
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      username: request.body.username,
      contact: request.body.contact,
      password: passwordHash.generate(request.body.password),
      user_type: "Company_User",
      permissions: [{company_permissions:permission, admin_permissions: null}],
      company_id: request.body.company_id,
    });
    await newUser.save();
    //console.log(newUser);
    return response.json({
      message: "User added successfully",
      user: newUser,
    });
  } catch (error) {
    console.log("Error : ", error);
  }
};

export const getCompanyUserList = async (request,response)=>{
  try {
    
   let company_users =await User.find({user_type:"Company_User" , company_id:request.query.id});
   response.status(200).send(company_users);

  } catch (error) {
    console.log(error);
  }
}



export const filterCompany = async(request , response)=>{

try {
  



let currentDate = new Date().toISOString();

  
  let test= request.params.vacancy;
let id = request.body
// console.log(id);
let query = null;
switch (request.params.time) {
  case "One":
    query = job.find({uploadBy: request.params.id});
    break;
  case "Two":
    query = job.find({ $and:
      [ {uploadBy: request.params.id },{ validTill: { $gte: currentDate } }]})
    break;
  case "Three":
    query = job.find({$and:
      [ {uploadBy: request.params.id },{ validTill: { $lte: currentDate } }] }) 
    break;
}
if(query){


await query.exec(async function (err, res) {
  // console.log("RES:", res);
 let data = [];
 
 data = res;
 
  if(test === "true"){
    let jobs = [];
   data.map((item , index)=>{
    // console.log(index ,"---" ,item)

    if(item.location === "Loc" ){
      jobs.push(item)
    }
   })
  //  console.log("res1",jobs)
   return response.json({ jobs });

    
  }else{
    // console.log("res2:",res)
let jobs=[]
jobs=res;
  return response.json({jobs})
  }
  if (err) {
    // response.json({ Error: "Cannot Send Mails" });
    return;
  }




  
  // res.map((item) => contact.push(item._id));
  // console.log(contact);})

})
}


} catch (error) {
  console.log(error)
}
}
