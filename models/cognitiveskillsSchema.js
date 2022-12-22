import mongoose from "mongoose";

const cognitiveskillsSchema = new mongoose.Schema({
  skill: {
    type: String,
    unique: true,
    required: true,
  }
});

const cognitiveskill = mongoose.model("cognitiveskill", cognitiveskillsSchema);
export default cognitiveskill;
