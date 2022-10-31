import mongoose from "mongoose";

const xiInterviewApplicationSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  status: {
    type: String
  },
  interviewid: {
    type: String,
    required: false,
    default: "",
  },
  interviewerid: {
    type: String,
    required: false,
    default: "",
  },
  type:{
    type: String,
    required: false,
    default: "",
  }
});

const XiInterviewApplication = mongoose.model(
  "xiInterviewApplicationabc",
  xiInterviewApplicationSchema
);
export default XiInterviewApplication;