import mongoose from "mongoose";
import user from "./userSchema.js";

const interviewQuestionSchema = new mongoose.Schema({
    question:{
        type: String,
        required: true
    },
    answer:{
        type: String,
        required: false
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
});

const interviewQuestion = mongoose.model("interviewQuestion", interviewQuestionSchema);
export default interviewQuestion;