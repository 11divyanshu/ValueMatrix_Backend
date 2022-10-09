import mongoose from "mongoose";
import user from "./userSchema.js";

const countryCodeSchema = new mongoose.Schema({
  country: {
    type: "string",
    required: true,
    unique: true,
  },
  code: {
    type: "string",
  },
  iso: {
    type: "string",
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
});
const countryCode = new mongoose.model("countryCode", countryCodeSchema);
export default countryCode;
