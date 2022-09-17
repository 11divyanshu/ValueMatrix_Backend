import mongoose from "mongoose";

const universityListSchema = mongoose.Schema({
    name :{
        type:String,
        required:true,
    },
    country:{
        type:String,
        required: false,
    },
})

const UniversityList = mongoose.model('University',universityListSchema);
export default UniversityList;