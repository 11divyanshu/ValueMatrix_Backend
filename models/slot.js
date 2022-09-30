import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  slotId: {
    type: Number,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  candidateId: {
    type:  mongoose.Schema.Types.ObjectId,
  },
  status: {
    type: String,
    default : "Available"
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  createDate: {
    type: Date,
    default: Date.now(),
  },
  interviewId:{
    type: mongoose.Schema.Types.ObjectId,
  },
  updateDate: {
    type: Date,
    default: Date.now(),
  },
});

const slot = mongoose.model("slot", slotSchema);
export default slot;
