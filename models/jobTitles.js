import mongoose from "mongoose";

const jobTitleSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
    }
})

const jobTitle = new mongoose.model("jobTitle", jobTitleSchema);
export default jobTitle;