import mongoose from "mongoose";

const performanceMultiplierSchema = new mongoose.Schema({
  multiplier: {
    type: Number,
    required: true,
    unique:true,
  },
  min: {
    type: Number,
    required: true,
 },
  max: {
    type: Number,
    required: true,
 },
 isDeleted:{
    type:Boolean,
    default:false,
 }
 
});

const PerformanceMultiplier = mongoose.model(
  "performanceMultiplier",
  performanceMultiplierSchema
);
export default PerformanceMultiplier;