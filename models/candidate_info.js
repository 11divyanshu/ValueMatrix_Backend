import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  candidate_id: {
    type: Number,
    required: true,
    default: 0
  },
  company_id: {
    type: String
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
  },
  phoneNo: {
    type: String,
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  jobId: {
    type: String,
    default:""
  },
});

const candidate_info = new mongoose.model("Candidate_info", candidateSchema);
export default candidate_info;
