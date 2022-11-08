import mongoose from "mongoose";

const userCreditSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
    
  },
  user_type:{
    type:String
  },
  
  credit: {
    type: Number,
    default:0
    
 },
  defaultCredit: {
    type: Number,
 },

 
});

const userCredit_info = mongoose.model(
  "userCredit_info",
  userCreditSchema
);
export default userCredit_info;