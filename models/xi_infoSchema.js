import mongoose from "mongoose";
import user from "./userSchema.js";

const xiSchema = new mongoose.Schema({
  
  candidate_id: {
    type: mongoose.Schema.Types.ObjectId,
    required:true,
  },
  limit: {
    type: Number,
    default:0,
  },
  payout: {
    type: Number,
    default:0,
  },
  category: {
    type: String,
    default:"",
  },
  multiplier: {
    type: Number,
    default:0,
  },
  level: {
    type: Number,
    default:0,
  },
  cat: {
    type: Number,
    default:0,
  },
  categoryId: {
    type: String,
   default:'',
  },
  levelId: {
    type: String,
    default:'',
  },
  multiplierId: {
    type: String,
    default:'',
  },
  interviews:{
    type:Array,
    default:[],
  },
  count:{
    type:Number,
    default:0,
  },
  rating:{
    type:Number,
    default:0,
  },
  panelId:{
    type: String,
    default:'',
  },
});

const xi_info = new mongoose.model("xi_info", xiSchema);
export default xi_info;
