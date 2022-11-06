import async from "async";
import User from "../models/userSchema.js";
import Slot from "../models/slot.js";
import Candidate from "../models/candidate_info.js";
import unirest from "unirest";
import mongoose from "mongoose";
import xi_info from "../models/xi_infoSchema.js";
var req = unirest("GET", "https://www.fast2sms.com/dev/bulkV2");
var fastsms_api = process.env.FAST2SMS_API_KEY;

export const ValidateSlot = async (request, response) => {
  try {
    console.log(request.body)
    await Slot.find(
      { createdBy: request.body.id, isDeleted: false },
      async (err, res) => {
        if (err) {
        } else {
          let currentDate = new Date(request.body.startTime);
          let startDate = new Date(currentDate.getFullYear(), 0, 1);
          var days = Math.floor((currentDate - startDate) /
            (24 * 60 * 60 * 1000));



          var weekNumber = Math.ceil(days / 7);
          let count = 0;
          for (let i = 0; i < res.length; i++) {
            if (res[i].weekNo == weekNumber) {
              count++;
            }
          }
          console.log(count)
          let limit = 0;
          await xi_info.find({ candidate_id: request.body.id }, function (err, res) {
            if (res) {

              limit = res[0].limit;

              if (count >= limit) {
                return response.status(200).json({ check: false });
              } else {
                return response.status(200).json({ check: true });

              }
            }
          }).clone();




        }
      }
    );


  } catch (error) {
    // response.status(400).send('something went wrong', error);

  }
}

export const addSlot = (data, callback) => {
  try {
    let user_type;
    async.series(
      [

        function (cb) {
          try {
            User.findOne(
              { _id: data[0].createdBy },
              { user_type: 1 },
              (err, res) => {
                if (err) {
                  return cb(err, null);
                }
                user_type = res.user_type;
                if (res && res.user_type !== "XI" && res.user_type !== "SuperXI") {
                  return cb("Your not eligible to create slot", null);
                }
                cb();
              }
            );
          } catch (err) {
            cb(err, null);
          }
        },

        function (cb) {
          console.log(user_type)
          try {
            let insertData = [];



            for (let i = 0; i < data.length; i++) {

              Slot.find(
                { createdBy: data[i].createdBy, isDeleted: false }, async (err, res) => {
                  if (err) {
                    console.log(err)
                  } else {
                    for (let i = 0; i < res.length; i++) {
                      if ((res[i].startDate <= data[i].startDate && res[i].endDate >= data[i].startDate) || (res[i].startDate <= data[i].endDate && res[i].endDate >= data[i].endDate)) {
                        return cb("Slot Already Booked", null)
                      }
                    }
                  }
                })

              data[i].slotId = i;
              let currentDate = new Date(data[i].startDate);
              let startDate = new Date(currentDate.getFullYear(), 0, 1);
              var days = Math.floor((currentDate - startDate) /
                (24 * 60 * 60 * 1000));

              var weekNumber = Math.ceil(days / 7);
              let insertObj = {
                createdBy: data[i].createdBy,
                startDate: new Date(data[i].startDate),
                endDate: new Date(data[i].endDate),
                slotType: user_type,
                weekNo: weekNumber,
              };
              insertData.push(insertObj);


            }
            Slot.insertMany(insertData, (err, res) => {
              if (err) {
                cb(err, null);
              }
              cb(null, "Data saved  succesfully");
            });
          } catch (err) {
            cb(err, null);
          }
        },
      ],
      function (err, results) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, data);
        }
      }
    );
  } catch (err) {
    callback(err, null);
  }
};

export const availableSlots = (data, callback) => {
  try {
    console.log(data);
    Slot.find(
      { status: "Available", cancelBy: { $nin: [data.userId] }, isDeleted: false, slotType: data.type }).sort({ startDate: 1 })
      .exec(async (err, res) => {
        if (err) {
          callback(err, null);
        } else {
          // const data = await priorityEngine(res);
          callback(null, res);

        }
      }
      );
  } catch (err) {
    callback(err, null);
  }
};
const updateSlot = async (id, body) => {
  await Slot.findOneAndUpdate(
    { _id: mongoose.Types.ObjectId(id) },
    body,

    (err, res) => {
      if (err) {
        console.log(err)
      } else {
        return;
      }
    }
  ).clone()
}


export const priorityEngine = async(request, response) => {
  // console.log(res)
  try {
    
 
  let date = request.query.date;
  console.log(date)
  console.log(request.body)
 
   await Slot.find(
    { status: "Available", isDeleted: false, startDate: request.query.date, slotType: request.body.type },
    async (err, res) => {
      if (err) {
        console.log(err)
      } else {
        // const data = await priorityEngine(res);
      
       let data = await helper(res);
       return response.status(200).json({slot:data});
      }
    }
    );
   

 

 

 
  
} catch (error) {
    
}
}

const helper = async(array) =>{
  console.log(array)
 
  for (let i = 0; i < array.length; i++) {
    let xi1 = 0;
    await xi_info.find({ candidate_id: array[i].createdBy }, async (err, res) => {
      if (res) {
        xi1 = res[0].level * res[0].cat * res[0].multiplier;
        array[i].value = xi1;
        await updateSlot(array[i]._id, { value: xi1 });
      }
    }).clone();
  }

  
array.sort(function(a, b){return a.value - b.value});
console.log(array)

for(let j=0 ;j <array.length ;j++){
  await updateSlot(array[j]._id, { priority: j });
}
    // for (let j = i + 1; j < array.length; j++) {
    //   console.log(j)


    //     console.log("inside if")
    //     let xi2 = 0;



    //     await xi_info.find({ candidate_id: array[j].createdBy }, async (err, res) => {
    //       if (res) {

    //         xi2 = res[0].level * res[0].cat * res[0].multiplier;
    //         array[j].value = xi2;
    //         await updateSlot(array[j]._id, { value: xi2 });

    //         console.log(xi1)
    //         console.log(xi2)
    //         if (xi2 > xi1) {
    //           console.log("1", xi2)
    //           await updateSlot(array[j]._id, { priority: array[j].priority + 1 });
    //           array[j].priority = array[j].priority + 1;

    //         }
    //         if (xi1 > xi2) {
    //           console.log(xi2)
    //           await updateSlot(array[i]._id, { priority: array[i].priority + 1 });

    //           array[i].priority = array[i].priority + 1;
    //         }
    //         if (xi1 == xi2) {
    //           console.log("equal")
    //           await updateSlot(array[j]._id, { priority: array[j].priority });

    //           array[i].priority = array[j].priority;
    //         }
    //       }
    //     }).clone();

      
    // }

  
  return array;

}


export const findCandidateByEmail = async (req, response) => {
  const email = req.query.email;
  await Candidate.find({ email: email }, async function (err, res) {
    return response.status(200).json(res);
  }).clone()
}



export const bookSlot = (data, callback) => {
  try {
    let OTP = "";


    async.parallel(
      [
        function (cb) {
          try {
            Candidate.findOne(
              { candidate_id: data.candidate_id },
              { phoneNo: 1 },
              (err, res) => {
                if (err) {
                  return cb(err, null);
                }


                var digits = "0123456789";
                for (let i = 0; i < 6; i++) {
                  OTP += digits[Math.floor(Math.random() * 10)];
                }
                req.query({
                  authorization: fastsms_api,
                  variables_values: OTP,
                  route: "otp",
                  numbers: res.phoneNo,
                });
                req.headers({
                  "cache-control": "no-cache",
                });
                req.end(function (res) {
                  if (res.error) cb({ Error: res.error }, null);
                  else cb(null, { otp: OTP });
                });
              }
            );

          } catch (err) {
            cb(err, null);
          }
        },
      

        function (cb) {
          try {
            Slot.aggregate(
              [
                { $match: { _id: mongoose.Types.ObjectId(data.slotId) } },
                {
                  $lookup: {
                    from: "users",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "user",
                  },
                },
              ],
              (err, res) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log(res[0].user)
                  req.query({
                    authorization: fastsms_api,
                    route: "q",
                    message:
                      "Candidate request to book your slot. Please acknowledge",
                    numbers: res[0].user[0].contact,
                  });
                  req.headers({
                    "cache-control": "no-cache",
                  });
                  req.end(function (res) {
                    if (res.error) cb({ Error: res.error }, null);
                    else cb();
                  });
                }
              }
            );
          } catch (err) {
            cb(err, null);
          }
        },
      ],
      function (err, results) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, { OTP });
        }
      }
    );
  } catch (err) {
    callback(err, null);
  }
};

export const slotUpdate = (req, callback) => {
  try {
    Slot.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(req.query.slotId) },
      req.body,
      { returnOriginal: false },
      (err, res) => {
        if (err) {
          callback(err, null);
        } else {
          callback(null, res);
        }
      }
    );
  } catch (err) {
    callback(err, null);
  }
};
export const slotdelete = (req, callback) => {
  try {
    Slot.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(req.query.slotId) },
      {
        isDeleted: true,
        status: "Available",
        $unset: { candidateId: 1, interviewId: 1 }
      },
      { returnOriginal: false },
      (err, res) => {
        if (err) {
          callback(err, null);
        } else {
          callback(null, res);
        }
      }
    );
  } catch (err) {
    callback(err, null);
  }
};

export const XISlots = (request, response) => {
  try {
    Slot.find({ createdBy: request.query.id, isDeleted: false }, async function (err, res) {
      if (err) {
        return response.status(500).json({ Message: "No Available Slots" });
      }
      if (res) {
        return response.status(200).json(res);
      }
    })
  } catch (error) {
    res.status(400).send('something went wrong', err);

  }
}


export const slotDetailsOfXI = async (req, res) => {
  try {
    const data = await Slot.aggregate([
      { $match: { createdBy: mongoose.Types.ObjectId(req.query.XI_id) } },
      {
        $lookup: {
          from: "interviewapplications",
          localField: "interviewId",
          foreignField: "_id",
          as: "interviewApplication",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "interviewApplication.applicant",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "jobs",
          localField: "interviewApplication.job",
          foreignField: "_id",
          as: "job",
        },
      },
    ]);
    console.log(data);
    res.send(data)
  }
  catch (err) {
    console.log(err);
    res.status(400).send('something went wrong', err);
  }
}
export const slotDetailsOfXIinterview = async (req, res) => {
  try {
    const data = await Slot.aggregate([
      { $match: { createdBy: mongoose.Types.ObjectId(req.query.XI_id) } },
      {
        $lookup: {
          from: "xiInterviewapplications",
          localField: "interviewId",
          foreignField: "_id",
          as: "interviewApplication",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "interviewApplication.applicant",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "jobs",
          localField: "interviewApplication.job",
          foreignField: "_id",
          as: "job",
        },
      },
    ]);
    console.log(data);
    res.send(data)
  }
  catch (err) {
    console.log(err);
    res.status(400).send('something went wrong', err);
  }
}








export const slotDetailsOfUser = async (req, res) => {
  try {
    const data = await Slot.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(req.query.userId) } },
      {
        $lookup: {
          from: "interviewapplications",
          localField: "interviewId",
          foreignField: "_id",
          as: "interviewApplication",
        },
      },
      {
        $lookup: {
          from: "xiinterviewapplications",
          localField: "interviewId",
          foreignField: "_id",
          as: "xiinterviewApplication",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "XI",
        },
      },
      {
        $lookup: {
          from: "jobs",
          localField: "interviewApplication.job",
          foreignField: "_id",
          as: "job",
        },
      },
    ]);
    // console.log(data);
    res.send(data)
  }
  catch (err) {
    console.log(err);
    res.status(400).send('something went wrong', err);
  }
}

export const userInterviewsDetails = async (req, res) => {
  try {
    const data = await Slot.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(req.query.slotId)} },
      {
        $lookup: {
          from: "interviewapplications",
          localField: "interviewId",
          foreignField: "_id",
          as: "interviewApplication",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "XI",
        },
      },
      {
        $lookup: {
          from: "jobs",
          localField: "interviewApplication.job",
          foreignField: "_id",
          as: "job",
        },
      },
    ]);
    // console.log(data);
    res.send(data)
  }
  catch (err) {
    console.log(err);
    res.status(400).send('something went wrong', err);
  }
}