import mongoose from "mongoose";

const companyBinSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
    }
})

const companybin = new mongoose.model("Companybin", companyBinSchema);
export default companybin;