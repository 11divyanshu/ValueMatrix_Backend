import mongoose from "mongoose";
import user from "./userSchema.js";

const notificationSchema = new mongoose.Schema({
    timeCreated: {
        type: Date,
        default: Date.now(),
    },
    forAll:{
        type:Boolean,
        default : true,
    },
    title:{
        type: String,
        required:true,
    },  
    message:{
        type:String,
        required:true
    },
    user_type:{
        type:Array,
        // All ,Admin, User
    },
    hideFrom:{
        type: Array(String),
        default: []
    },
    type:{
        type: String,
        enum : ["Email", "Notification","OneSignal"],
        default:"Notification",
    }
})

const notification = mongoose.model("notification", notificationSchema);

export default notification;