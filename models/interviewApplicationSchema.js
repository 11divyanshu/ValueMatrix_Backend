import mongoose from "mongoose";
import user from "./userSchema.js";
import Job from "./jobSchema.js";

const interviewApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["Pending", "Accepted", "Rejected", "Scheduled"],
    default: "Pending",
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
  interviewers: {
    type: Array,
  },
});

const InterviewApplication = mongoose.model(
  "InterviewApplication",
  interviewApplicationSchema
);
export default InterviewApplication;