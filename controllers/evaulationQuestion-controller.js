import mongoose from "mongoose";
import User from "../models/userSchema.js";
import EvaulationQuestion from "../models/evaluationQuestionSchema.js";

export const addEvaluationQuestion = async (req, response) => {
  try {
    //console.log(req.body);
    await User.findOne({ _id: req.body.user_id }, function (err, res) {
      if (!res) return res.status(400).json({ message: "User not found" });
      if (res.isAdmin === false)
        if (res.user_type !== '"Admin_User')
          return response.status(400).json({ message: "User is not an admin" });
    }).clone();
    let questions = req.body.questions;
    questions.forEach(async (question) => {
      let q = {
        question: question.question,
        answer: question.answer ? question.answer : "",
      };
      let ques = new EvaulationQuestion(q);
      await ques.save();
    });
    return response
      .status(200)
      .json({ message: "Questions added successfully" });
  } catch (err) {
    console.log(err);
  }
};
