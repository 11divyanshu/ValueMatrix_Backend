import mongoose from "mongoose";
import user from "./userSchema.js";

const evaluationQuestionSchema = new mongoose.Schema({
    question:{
        type: String,
        required: true
    },
    answer:{
        type: String,
        required: false
    },
});

const evaulationQuestion = mongoose.model("evaluationQuestion", evaluationQuestionSchema);
export default evaulationQuestion;