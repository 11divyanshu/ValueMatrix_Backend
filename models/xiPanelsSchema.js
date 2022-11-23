import mongoose from "mongoose";

const xiPanelsSchema = new mongoose.Schema({
  panel: {
    type: String,
    required: true,
    unique:true,
  },
  permissions: {
    type: Array,
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