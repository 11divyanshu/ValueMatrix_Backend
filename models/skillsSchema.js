import mongoose from "mongoose";

const skillsSchema = new mongoose.Schema({
  primarySkill: {
    type: String,
    unique: false,
    required: true,
  },
  secondarySkill: {
    type: String,
    unique: false,
    required: true,
  },
  proficiency: {
    type: Number,
    unique: false,
    required: false,
    max: 5,
  },
  role : {
    type : String,
    required : true,
  }
});

const skill = mongoose.model("Skill", skillsSchema);
export default skill;
