
import mongoose from "mongoose";

import User from "../models/userSchema.js";
import Candidate from "../models/candidate_info.js";

export const addCandidate = async (req, res) => {
  try {
    const CandidadeCount = await Candidate.count(req.body);
    for (let i = 0; i < req.body.length; i++) {
      console.log(req.body[i]);
      req.body[i].candidate_id = CandidadeCount + i;
    }
    let newCandidate = await Candidate.insertMany(req.body);
    return res.json({
      message: "Candidate added successfully",
      candidate: newCandidate,
    });
  } catch (error) {
    console.log("Error : ", error);
    res.status(500).json({ message: error.message });
  }
};

export const listCandidate = async (req, res) => {
  try {
    const CandidateList = await Candidate.find({ isDeleted: false, company_id:req.query.company_id });
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
    let candidateId = req.params.id;

    Candidate.findOneAndUpdate(
      { candidate_id: candidateId },
      { isDeleted: true },
      async function (err, resonse) {
        const CandidateList = await Candidate.find({ isDeleted: false });
        res.status(200).json(CandidateList);
      }
    );
   
      let company_id = req.body.company_id;
      console.log(req.body);
      const CandidateList = await Candidate.find({company_id:company_id, isDeleted: false }).clone();
      console.log(CandidateList);
      res.status(200).json(CandidateList);
   
   
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
      { $match: { email: { $in: userList }, company_id: req.body.company_id } },
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

