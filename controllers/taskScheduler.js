import cron from 'cron';
import InterviewApplication from '../models/interviewApplicationSchema.js';
import slot from '../models/slot.js';
import taskScheduler from '../models/taskSchedulerSchema.js';

export const createTaskScheduler = async(request ,response) =>{
    try {
        const task = {
            applicantId: request.body.applicantId,
            interviewerid : request.body.interviewerId,
            interviewid : request.body.interviewId,
            nextTime : request.body.nextTime,
            priority : request.body.priority,
            slotId:request.body.slotId,
            startDate:request.body.startDate,
        }
        const schedule= new taskScheduler(task);
       await schedule.save();
       startTaskScheduler(schedule);
       return response.send().status(200);
    } catch (error) {
        return response.send().status(400)
    }
}



const startTaskScheduler =async(schedule)=>{
    const taskSchedule = cron.job('*/1 * * * * *',
    async () => {
        var date = new Date();
        await slot.findOne({_id:schedule.slotId , status :"Pending"},async function (err,res) {
            if(date.getFullYear() === new Date(schedule.nextTime).getFullYear() && date.getMonth === new Date(schedule.nextTime).getMonth && date.getDate === new Date(schedule.nextTime).getDate && date.getHours === new Date(schedule.nextTime).getHours && date.getMinutes === new Date(schedule.nextTime).getMinutes  &&   res){

                let findSlot = await slot.findOne({startDate : schedule.startDate , priority : schedule.priority + 1}).clone()
                if(findSlot){

                    await taskScheduler.findOneAndUpdate({_id:schedule._id},{slotId:findSlot._id , priority:findSlot.priority}).clone()
                    
                    await slot.findOneAndUpdate({_id: findSlot._id},{interviewid:schedule.interviewid , userId: schedule.applicantId}).clone()
                }
            }else{

            }
            
        }).clone()
      

     },

    );

    taskSchedule.start();
    
}






      //  const data = await slots.aggregate([
    //         { $match: { status: 'Accepted' } },
    //         {
    //             $lookup: {
    //                 from: "users",
    //                 localField: "createdBy",
    //                 foreignField: "_id",
    //                 as: "interviewer",
    //             }
    //         },
    //         { $unwind: '$interviewer' },
    //         {
    //             $lookup: {
    //                 from: "users",
    //                 localField: "userId",
    //                 foreignField: "_id",
    //                 as: "candidate",
    //             }
    //         },
    //         { $unwind: '$candidate' },
    //         {
    //             "$project": {
    //                 "candidate.email": 1,
    //                 "candidate.contact": 1,
    //                 "interviewer.email": 1,
    //                 "interviewer.contact": 1,
    //             }
    //         },

    //     ])
    //     console.log(data);
    //     req.query({
    //         authorization: fastsms_api,
    //         route: "q",
    //         message: "You have schedule interview in 5 minutes. Please attend without fail. All the best!",
    //         numbers: ['8639675114'],
    //     });
    //     req.headers({
    //         "cache-control": "no-cache",
    //     });
    //     req.end(function (res) {
    //         if (res.error) cb({ Error: res.error }, null);
    //     });

    //     console.log('You will see this message every second');
    
