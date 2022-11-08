import mongoose from "mongoose";

const xiCategorySchema = new mongoose.Schema({
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

const XICategory = mongoose.model(
  "xiCategorySchema",
  xiCategorySchema
);
export default XICategory;