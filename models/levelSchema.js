import mongoose from "mongoose";

const levelSchema = new mongoose.Schema({
  level: {
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

const Level = mongoose.model(
  "level",
  levelSchema
);
export default Level;