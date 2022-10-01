import mongoose from "mongoose";

const companyListBinSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
    }
})

const companyBin = new mongoose.model("CompanyBin", companyListBinSchema);
export default companyBin;