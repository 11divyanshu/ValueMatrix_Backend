import mongoose from "mongoose";

const skillsSchema = new mongoose.Schema({
    skill : {
        type: String,
        unique : true,
    }
})

const skill = mongoose.model("Skill", skillsSchema);
export default skill;