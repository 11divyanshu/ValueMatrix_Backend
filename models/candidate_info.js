import mongoose from "mongoose";

const candidate_info = new mongoose.Schema({
    candidate_id: {
        type: Integer,
        required: true
    },
    company_id: {
        type: Integer,
        required: true
    },
    firstName:{
        type:String,
    },
    lastName:{
        type:String,
    },
    email:{
        type:String,
    },
    phoneNo:{
        type:String,
    }
})

const company = new mongoose.model("Candidate_info", candidate_info);
export default candidate_info;