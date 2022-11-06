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
  weekNo:{
  type:Number,
  required:true,
  },
  userId: {
    type:  mongoose.Schema.Types.ObjectId,
  },
  status: {
    type: String,
    default : "Available"
  },
  priority: {
    type: Number,
  },
  value: {
    type: Number,
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
  _jobId:{
    type: mongoose.Schema.Types.ObjectId,
  },
  updateDate: {
    type: Date,
    default: Date.now(),
  },
  slotType:{
    type:String,
    enum : ["XI", "SuperXI"],

  }
});


const slot = mongoose.model("slot", slotSchema);
export default slot;
