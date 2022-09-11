import mongoose from "mongoose";
import user from "./userSchema.js";

const jobSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: true,
  },
  jobDesc: {
    type: String,
    required: true,
  },
  createTime: {
    type: Date,
    default: Date.now(),
  },
  uploadBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: user,
  },
  location: {
    type: String,
    required: true,
  },
  jobType: {
    type: String,
    required: true,
    enum: ["Internship", "Full-Time", "Part-Time", "Freelancing"],
  },
  applicants: {
    type: Array,
  },
  validTill: {
    type: Date,
  },
  hiringOrganization: {
    type: String,
    // type: Company
    required: true,
  },
  salary: {
    type: Number,
    required: false,
  },
  invitations: {
    type: Array,
    default: [],
  },
  invitations_declined: {
    type: Array,
    default: [],
  },
  perks: {
    type: String,
    required: false,
  },
  eligibility: {
    type: String,
    required: false,
  },
  skills: {
    type: Array,
    required: false,
  },
  reqApp:{
    type:Number,
   
  },
  archived:{
    type:Boolean,
    default: false,
  }
});



const job = mongoose.model("job", jobSchema);
export default job;
