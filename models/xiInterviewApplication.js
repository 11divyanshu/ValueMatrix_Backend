import mongoose from "mongoose";
import user from "./userSchema.js";

const xiInterviewApplicationSchema = new mongoose.Schema({
    interviewer: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  status: {
    type: String
  },
  createTime: {
    type: Date,
    default: Date.now(),
  },
  updateTime: {
    type: Date,
    default: Date.now(),
  },
  interviewDate: {
    type: Date,
    required: false,
  },
  interviewTime: {
    type: String,
    required: false,
  },
  interviewMeet: {
    type: String,
    required: false,
  },
});

const xiInterviewApplication = mongoose.model(
  "xiInterviewApplication",
  xiInterviewApplicationSchema
);
export default xiInterviewApplication;