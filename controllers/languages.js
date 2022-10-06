import async from "async";
import languages from "../models/languages.js";
import mongoose from "mongoose";
import jobTitle from "../models/jobTitles.js";
import jobTitleBin from "../models/jobTitlleBin.js";
import company from "../models/companyListSchema.js";

export const addLanguages = (body, callback) => {
  try {
    languages.insertMany(body, (err, res) => {
      if (err) {
        callback(err, null);
      }
      callback(null, "Data saved  succesfully");
    });
  } catch (err) {
    callback(err, null);
  }
};

export const jobTitles = (req, res) => {
  try {
    let uList = req.body.list;  
    uList.forEach(async(item)=>{
      // console.log(item);
      const title = new jobTitleBin({name:item.name});
      await title.save();
      res.status(200);
    })
  } catch (err) {
    
  }
};
export const addcompany = (req, res) => {
  try {
    let uList = req.body.list;  
    uList.forEach(async(item)=>{
      // console.log(item);
      const title = new company({name:item.name});
      await title.save();
      res.status(200);
    })
  } catch (err) {
    
  }
};

export const getJobTitles = async (req, res)=>{
  try {
    let title = await jobTitle.find({});
    // console.log(title)
    res.status(200).json(title);

  } catch (error) {
    
  }
}
export const listUnapproveTitles = async (req, res)=>{
  try {
    let title = await jobTitleBin.find({});
    // console.log(title)
    res.status(200).json(title);

  } catch (error) {
    
  }
}


export const approveTitle =  async(req , res) => {
  try {
    // console.log(req.body)
    const jobData = await jobTitleBin.findOne({ _id: req.body.id }).lean();
    delete jobData._id;
    delete jobData.__v;
    res.send(jobData.__v);
    const newJob = new jobTitle(jobData);
    await newJob.save();
    await jobTitleBin.findOneAndDelete({ _id: req.body.id });
    res.send();
  } catch (err) {
    console.log("Error approveCompany: ", err);
    res.send(err);
  }
};

export const listOfLanguages = (req, callback) => {
    try {
      languages.find({}, (err, res) => {
        if (err) {
          callback(err, null);
        }
        callback(null, res);
      });
    } catch (err) {
      callback(err, null);
    }
  };

  