
import mongoose from "mongoose";

import User from "../models/userSchema.js";
import Candidate from "../models/candidate_info.js";

export const addCandidate = async (req, res) => {
  try {

console.log(req.body);

    if (req.body.company_id === null || req.body.company_id === undefined) {
      return res.json({
        success: false,
        message: "Company id is required",
      });
    }

    await User.findOne({ _id: req.body.company_id }, function (err, res) {
      if (err) {
        console.log(err);
        return res.status(401).json("req User Not Found");
      }
      console.log(res.user_type);
      if (res && res.user_type !== "Company") {
        return res.status(401).json("req User Not Registered as a Company");
        return;
      }
    }).clone();

    let newCandidate = new Candidate(req.body);
    await newCandidate.save();
    // console.log(newCandidate);
   
    const CandidateList = await Candidate.find({company_id:req.body.company_id, isDeleted: false });
    console.log("CandidateList",CandidateList);
    res.status(200).json(CandidateList);
  } catch (error) {
    console.log("Error : ", error);
    res.status(500).json({ message: error.message });
  }
};

export const listCandidate = async (req, res) => {
  try {
     console.log("in");
    let company_id = req.body.id;
    const CandidateList = await Candidate.find({company_id:company_id, isDeleted: false });
    // console.log(CandidateList);
    res.status(200).json(CandidateList);
  } catch (error) {
    console.log("Error in listCandidate: ", error);
    res.status(500).json({ message: error.message });
  }
};




export const findAndDeleteCandidate = async (req, res) => {
  try {
    let candidateId = req.params.id;
// console.log(candidateId);
    const candidate = await Candidate.findOneAndUpdate(
      { _id: candidateId },
      { isDeleted: true }
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
