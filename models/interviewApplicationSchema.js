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
    type: String,
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
  evaluations: {
    type: Object,
    required: false,
    default:{}
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
  codequestion:{
    type:String,
    required: false,
  },
  codestdin:{
    type:String,
    default:"Code Inputs Appear Here...",
    required: false,
  },
  codestdout:{
    type:String,
    default: "Code Output Appears Here...",
    required: false,
  },
  output:{
    type:String,
    default:"",
    required: false,
  },
  input:{
    type:String,
    default:"",
    required: false,
  },
  generalQuestions:{
    type: Array,
    required: false
  },
  ps1:{
    type: Object,
    required: false
  },
  ps2:{
    type: Object,
    required: false
  },
  livestats:{
    type: Object,
    required: false
  },
  codearea:{
    type: String,
    required: false
  },
  codelanguage:{
    type: String,
    default: "Javascript",
    required: false
  }
});

const InterviewApplication = mongoose.model(
  "InterviewApplication",
  interviewApplicationSchema
);
export default InterviewApplication;