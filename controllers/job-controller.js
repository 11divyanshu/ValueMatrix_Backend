import mongoose from "mongoose";
import Job from "../models/jobSchema.js";
import User from "../models/userSchema.js";
import {} from "dotenv/config.js";
import fs from "fs";
import json2xls from "json2xls";

export const addJob = async (request, response) => {
  try {
    User.findOne({ _id: request.body.user_id }, async function (err, res) {
      if (res === null || res === undefined || res.isAdmin === false) {
        response.status(404).json({ Message: "Admin Not Found" });
        return;
      }

      let jobC = {
        jobTitle: request.body.jobTitle,
        jobDesc: request.body.jobDesc,
        uploadBy: res,
        location: request.body.location,
        jobType: request.body.jobType,
        validTill: request.body.validTill ? request.body.validTill : null,
        hiringOrganization: request.body.hiringOrganization,
        basicSalary: request.body.basicSalary ? request.body.basicSalary : null,
      };

      const newJob = new Job(jobC);
      await newJob.save();

      if (newJob) {
        response
          .status(200)
          .json({ Message: "Job Added Successfully", job: newJob });
        return;
      } else {
        response.status(401).json({ Message: "Error Adding Job" });
        return;
      }
    });
  } catch (error) {
    console.log("Error : ", error);
  }
};

// List Jobs
export const listJobs = async (request, response) => {
  try {
    await Job.find({})
      .sort({ createTime: -1 })
      .exec(async function (err, res) {
        await response.status(200).json({ jobs: res });
        return;
      });
  } catch (error) {
    console.log(error);
  }
};

// Update Jobs
export const updateJob = async (request, response) => {
  try {
    let user1 = null;
    await User.findOne({ _id: request.body.user_id }, function (err, res) {
      user1 = res;
      if (res === undefined || res === null || res.user_type !== "Company") {
        response.status(403);
        return;
      }
    });
    let job = Job.findOne({ _id: request.body.job_id });
    if (job.uploadBy !== user1) {
      response.status(403);
      return;
    }
    let newJob = Job.findOneAndUpdate(
      { _id: request.body.job_id },
      request.body.updates
    );
    response.status(200).json({ job: newJob });
  } catch (error) {
    console.log("Error : ", error);
  }
};

// Export JobDetails
export const exportJobDetails = async (request, response) => {
  try {
    var today = new Date();
    var date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();

    await Job.findOne({ _id: request.body.job_id }, async function (err, res) {
      if (res === undefined || res.uploadBy._id != request.body.user_id) {
        response.status(403);
        return;
      }

      // Saving and downloading job details
      var filename = res.jobTitle + " - Details " + date + ".xls";
      var file1 = json2xls(JSON.parse(JSON.stringify(res)));
      var detailsFile = await fs.writeFile(filename, file1, "binary", (err) => {
        if (err) console.log("wrtieFileSync Error : ", err);
      });
      await response.download(filename);
    //   fs.unlink(filename, (err) => {
    //     if (err) {
    //       console.log("Error deleting file : ", err);
    //     }
    //   });

      // Getting Canditates
      let candidateArr = res.applicants;
      let query = User.find({ _id: { $in: candidateArr } }).select({
        username: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        contact: 1,
      });
      await query.exec(async function (err1, res1) {
        if (res1 !== undefined) {
          var filename = res.jobTitle + " - Candidates " + date + ".xls";
          var file2 = json2xls(JSON.parse(JSON.stringify(res1)));
          var candidateFile = await fs.writeFile(
            filename,
            file2,
            "binary",
            (err) => {
              if (err) console.log("wrtieFileSync Error : ", err);
            }
          );
          await response.download(filename);
        //   fs.unlink(filename, (err) => {
        //     if (err) {
        //       console.log("Error deleting file : ", err);
        //     }
        //   });
        }
      });
    });
    response.status(200).json({ Message: "Files Downloaded" });
  } catch (error) {}
};


// Get Job From Id
export const GetJobFromId = async(request, response) => {
  try {
    
    await Job.findOne({_id : request.body.job_id}, function(err, res){
      if(res)
        response.status(200).json({job:res});
    })

  } catch (error) {
    
  }
}