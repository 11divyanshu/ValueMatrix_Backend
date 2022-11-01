import async from "async";
import User from "../models/userSchema.js";
import Slot from "../models/slot.js";
import Candidate from "../models/candidate_info.js";
import unirest from "unirest";
import mongoose from "mongoose";
var req = unirest("GET", "https://www.fast2sms.com/dev/bulkV2");
var fastsms_api = process.env.FAST2SMS_API_KEY;

export const ValidateSlot = (request,response) =>{
try {
  console.log(request.body)
  Slot.find(
    { createdBy:request.body.id, isDeleted: false },
    (err, res) => {
      if (err) {
      } else {
       let currentDate = new Date(request.body.startTime);
       let startDate = new Date(currentDate.getFullYear(), 0, 1);
        var days = Math.floor((currentDate - startDate) /
            (24 * 60 * 60 * 1000));
             


        var weekNumber = Math.ceil(days / 7);
        let count = 0;
        for(let i=0;i <res.length ;i++){
            if(res[i].weekNo == weekNumber){
              count++;
            }
        }
        console.log(count)


        if(count >=4){
          return response.status(200).json({check:false});
        }else{
          return response.status(200).json({check:true});

        }

      }
    }
  );


} catch (error) {
  
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
      { status: "Available", cancelBy: { $nin: [data.userId] }, isDeleted: false , slotType: data.type },
      (err, res) => {
        if (err) {
          callback(err, null);
        } else {
          console.log(res)
          callback(null, res);
        }
      }
    );
  } catch (err) {
    callback(err, null);
  }
};

export const findCandidateByEmail = async (req, response) => {
  const email = req.query.email;
  Candidate.find({ email: email }, async function (err, res) {
    return response.status(200).json(res);
  })
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
      { $match: { _id: mongoose.Types.ObjectId(req.query.slotId) , status:"Pending" } },
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