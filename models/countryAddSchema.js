import mongoose from "mongoose";

const countrySchema = new mongoose.Schema({
 
    country:{
        type:Array,
        required:true,
    },
   
});

const country = mongoose.model("address_country", countrySchema);

export default country;