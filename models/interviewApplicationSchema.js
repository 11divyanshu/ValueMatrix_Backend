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
  interviewers: {
    type: Array,
  },
  evaluations: {
    type: Object,
    required: false,
  },
  meetingRoom: {
    type: String,
    required: false,
    default: null
  },
  meetingID: {
    type: String,
    required: false,
    default: null
  },
  interviewStatus: {
    type: Boolean,
    required: false,
    default: false
  },
  firstEmotion: {
    type: String,
    required: false,
    default: null
  },
  faceTest: {
    type: Boolean,
    required: false,
    default: false
  },
  gazeTest: {
    type: Boolean,
    required: false,
    default: false
  },
  personTest: {
    type: Boolean,
    required: false,
    default: false
  },
  earTest: {
    type: Boolean,
    required: false,
    default: false
  },
  rating:{
    type:Number,
    default:0,
  },
  comment:{
    type:String,
    default:"",
  },
  code:{
    type:String,
    default:"",
    default: false
  },
  output:{
    type:String,
    default:"",
    default: false
  },
  input:{
    type:String,
    default:"",
    default: false
  }
});

const InterviewApplication = mongoose.model(
  "InterviewApplication",
  interviewApplicationSchema
);
export default InterviewApplication;