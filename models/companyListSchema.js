import mongoose from "mongoose";

const companyListSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
    }
})

const company = new mongoose.model("Company", companyListSchema);
export default company;