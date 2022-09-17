import mongoose from "mongoose";

const countrySchema = new mongoose.Schema({
 
    country:{
        type:String,
        required:true,
    },
    tax_id:{
        type:String,
        unique:true,
        required:true,
        
    }
});

const country = mongoose.model("Country", countrySchema);

export default country;