import mongoose from "mongoose";

const xiPanelsSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique:true,
  },
  cat: {
    type: Number,
    required: true,
 },
  limit: {
    type: Number,
    required: true,
 },
  payout: {
    type: Number,
    required: true,
 },
 isDeleted:{
   type:Boolean,
   default:false,
 }
 
});

const XIPanels = mongoose.model(
  "xiPanelsSchema",
  xiPanelsSchema
);
export default XIPanels;