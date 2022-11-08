import mongoose from "mongoose";

const creditConverterSchema = new mongoose.Schema({
  currency: {
    type: Object,
    required: true,
   
  },
  

  amount: {
    type: Number,
    required: true,
  },

  isDeleted: {
    type: Boolean,
    default: false,
  }

});

const CreditConverter = mongoose.model(
  "creditConverterSchema",
  creditConverterSchema
);
export default CreditConverter;