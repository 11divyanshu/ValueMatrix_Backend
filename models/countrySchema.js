import mongoose from "mongoose";

const countrySchema = new mongoose.Schema({

    country:{
        type:Array,
    }
});

const country = mongoose.model("Country", countrySchema);

export default country;