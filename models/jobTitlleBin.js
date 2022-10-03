import mongoose from "mongoose";

const jobTitleBinSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
    }
})

const jobTitleBin = new mongoose.model("jobTitleBin", jobTitleBinSchema);
export default jobTitleBin;