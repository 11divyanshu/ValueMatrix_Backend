import mongoose from "mongoose";

const taskSchedulerSchema = new mongoose.Schema({

    taskType: {
        type: String,
        default:"Invitation"
    },
    applicantId: {
        type: mongoose.Types.ObjectId,
       
    },
    interviewId: {
        type: mongoose.Types.ObjectId,
       
    },
    slotId: {
        type: mongoose.Types.ObjectId,
       
    },
    interviewerId: {
        type: mongoose.Types.ObjectId,
       
    },
    createdTime: {
        type: Date,
        default: new Date()
       
    },
    nextExecutionTime: {
        type: Date,
   },
   priority:{
         type:Number
   },
   startDate:{
         type:Date
   }

    


});

const taskScheduler = mongoose.model(
    "taskScheduler",
    taskSchedulerSchema
);
export default taskScheduler;