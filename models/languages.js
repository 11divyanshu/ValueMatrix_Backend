import mongoose from "mongoose";
import user from "./userSchema.js";

const langSchema = new mongoose.Schema({
  name: {
    type: "string",
    required: true,
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
const language = new mongoose.model("languages", langSchema);
export default language;
