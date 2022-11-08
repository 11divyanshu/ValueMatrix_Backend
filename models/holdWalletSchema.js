import mongoose from "mongoose";

const holdWalletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
    
  },
  user_type:{
    type:String
  },
  
  amount: {
    type: Number,
    
 },
 jobId:{
    type: mongoose.Types.ObjectId
 },
 XiUpgrade:{
    type:Boolean
 }

 
});

const holdWallet = mongoose.model(
  "holdWallet",
  holdWalletSchema
);
export default holdWallet;