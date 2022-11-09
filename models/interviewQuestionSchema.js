import mongoose from "mongoose";
import user from "./userSchema.js";

const interviewQuestionSchema = new mongoose.Schema({
    question:{
        type: String,
        required: true
    },
    type:{
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
    },
    category:{
        type: String,
        default: true
    },
    level:{
        type: String,
        default: true
    },
    experience:{
        type: String,
        default: true
    },
    usage:{
        type: Array,
        required: false,
        default: []
    }
});

const interviewQuestion = mongoose.model("interviewQuestion", interviewQuestionSchema);
export default interviewQuestion;