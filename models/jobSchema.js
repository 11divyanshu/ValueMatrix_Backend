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
  jobLocation: {
    type: String,
    required: true,
    enum: ["Remote", "Hybrid", "On-Site"],
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
    type: Array,
    // [currency, min,max]
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
  reqApp: {
    type: Number,

  },
  archived: {
    type: Boolean,
    default: false,
  },
  questions: {
    type: Array,
    required: false,
    default: []
  },
  location: {
    type: String
  },
  showComName: {
    type: Boolean,
  },
  showComLogo: {
    type: Boolean,
  },
  showEducation: {
    type: Boolean,
  },
  showContact: {
    type: Boolean,
  },
  showEmail: {
    type: Boolean,
  },
  status: {
    type: String,
  },
  draft: {
    type: Boolean,
  }
});



const job = mongoose.model("job", jobSchema);
export default job;
