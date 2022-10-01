import mongoose from "mongoose";

import User from "../models/userSchema.js";
import Candidate from "../models/candidate_info.js";
import Jobs from "../models/jobSchema.js";

export const addCandidate = async (req, res) => {
  try {
    const CandidadeCount = await Candidate.count(req.body);
    for (let i = 0; i < req.body.length; i++) {
      console.log(req.body[i]);
      req.body[i].candidate_id = CandidadeCount + i;
    }
    let newCandidate = await Candidate.insertMany(req.body);
    // console.log(newCandidate);
   
    const CandidateList = await Candidate.find({ isDeleted: false, company_id:req.body[0].company_id });
    res.status(200).json(CandidateList);
  } catch (error) {
    console.log("Error : ", error);
    res.status(500).json({ message: error.message });
  }
};




export const listCandidate = async (req, res) => {
  try {
   
    const CandidateList = await Candidate.find({ isDeleted: false, company_id:req.query.id });
    // console.log(CandidateList);
    if ( CandidateList.length == 0) {
      return res.json({
        success: false,
        message: "Candidates not found",
      });
    }
    res.status(200).json(CandidateList);
  } catch (error) {
    console.log("Error in listCandidate: ", error);
    res.status(500).json({ message: error.message });
  }
};






export const findAndDeleteCandidate = async (req, res) => {
  try {
    let candidateId = req.query.id;
    let companyId = req.body.company;
    console.log(companyId)
    let isDeleted = false;
    if(req.body.isDeleted == true){
       isDeleted = false;
    }else{
      isDeleted = true;
    }
    console.log(isDeleted)


    Candidate.findOneAndUpdate(
      { candidate_id: candidateId },
      { isDeleted: isDeleted },
      async function (err, resonse) {
        const CandidateList = await Candidate.find({ company_id: companyId, isDeleted: false });
        console.log(CandidateList);
        res.status(200).json(CandidateList);
      }
    );


    // let company_id = req.body.company_id;
    // console.log(req.body);
    // const CandidateList = await Candidate.find({
    //   company_id: company_id,
    //   isDeleted: false,
    // }).clone();
    // console.log(CandidateList);
    // res.status(200).json(CandidateList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const findAndUpdateCandidate = async (req, res) => {
  try {
    let candidateId = req.params.id;

    Candidate.findOneAndUpdate(
      { candidate_id: candidateId },
      req.body,
      async function (err, resonse) {
        const CandidateList = await Candidate.find({ isDeleted: false });
        res.status(200).json(CandidateList);
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const eligibleCandidateList = async (req, res) => {
  try {
    let userList = await User.aggregate([
      { $match: { "tools._id": { $in: req.body.skills } } },
      { $project: { email: "$email", _id: false } },
    ]);

    userList = userList.map((a) => a.email);
    const candidateList = await Candidate.aggregate([
      { $match: { email: { $in: userList }, company_id: req.body.companyid } },
    ]);
    if (userList.length == 0 || candidateList.length == 0) {
      return res.json({
        success: false,
        message: "Candidates not found",
      });
    }
    res.status(200).json(candidateList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const saveCandidateReport = async (req, res) => {
  try {
    console.log(req.query.candidate_id);
    const data = await Candidate.aggregate([
      { $match: { candidate_id: Number(req.query.candidate_id) } },
      {
        $lookup: {
          from: "users",
          localField: "email",
          foreignField: "email",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "interviewapplications",
          localField: "user._id",
          foreignField: "applicant",
          as: "interviewapplications",
        },
      },
      {
        $lookup: {
          from: "jobs",
          localField: "interviewapplications.job",
          foreignField: "_id",
          as: "jobs",
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const eligibleJobsForCandidate = async (req, res) => {
  try {
    let skills = await User.findOne(req.query, { "tools._id": 1 });
    skills = skills.tools.map((a) => a._id);
    let jobs = await Jobs.aggregate([
      { $match: { "skills._id": { $in: skills } } },
    ]);

    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
