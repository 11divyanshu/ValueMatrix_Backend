import mongoose from "mongoose";

const creditCategorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique:true,
  },
 
  amount: {
    type: Number,
    required: true,
 },
 
 isDeleted:{
   type:Boolean,
   default:false,
 }
 
});

const CreditCategory = mongoose.model(
  "creditCategorySchema",
  creditCategorySchema
);
export default CreditCategory;