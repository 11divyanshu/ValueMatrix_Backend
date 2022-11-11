import mongoose from "mongoose";
import User from "../models/userSchema.js";
import UserBin from "../models/userSchemaBin.js";
import Candidate from "../models/candidate_info.js";
import Country from "../models/countrySchema.js";
import AddCountry from "../models/countryAddSchema.js";
import axios from "axios";
import passwordHash from "password-hash";
import v4 from "uuid/v4.js";
import { } from "dotenv/config";
import Job from "../models/jobSchema.js";
import Interview from "../models/interviewApplicationSchema.js";
import multer from "multer";
import fs from "fs";
import sendGridMail from "@sendgrid/mail";
import FormData from "form-data";
import path from "path";
import XIInterview from "../models/xiInterviewApplication.js";
import xi_info from "../models/xi_infoSchema.js";
import userCredit_info from "../models/userCreditSchema.js";
import { request } from "http";

const url = process.env.BACKEND_URL;
const front_url = process.env.FRONTEND_URL;
const IMAGEPATH = process.env.IMAGEPATH
sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

var storage = multer.memoryStorage({
  destination: (req, file, cb) => {
    cb(null, "media/profileImg");
  },
  filename: (req, file, cb) => {
    cb(null, file.filename + "-" + Date.now());
  },
});
var upload = multer({ storage: storage });

let profileData = {
  firstName: "",
  username: "",
  email: "",
  password: "",
  contact: "",
  address: "",
  education: [],
  desc: [],
  billing: [],
  experience: [],
  associate: [],
  tools: [],
  timeRegistered: "",
  isAdmin: null,
  user_type: "",
  permissions: [],
  access_valid: null,
  resetPassId: "",
  invite: null,
  job_invitations: [],
  linkedInId: "",
  access_token: "",
  resume: "",
  city: "",
  country: "",
  houseNo: "",
  street: "",
  state: "",
  zip: "",
  language: [],
  secondaryContacts: [],
  secondaryEmails: [],
  profileImg: "",
  googleId: "",
};

export const handleXIStatusChange = async (request, response) => {
  try{
    let data = request.body;
    console.log("data" ,data)
    let user  = await User.findOneAndUpdate({_id:data.id}, {status:data.status}) ; 
    console.log(user)
    return response.send("XI status updated successfully.").status(200)
  } catch (error) {
    console.log("Error : ",  error);
  }
};

// Validate Signup details
export const vaildateSignupDetails = async (request, response) => {
  try {
    let user1 = null,
      user2 = null,
      user3 = null;
    if (request.body.email)
      user1 = await User.findOne({ email: request.body.email });
    if (request.body.contact)
      user2 = await User.findOne({ contact: request.body.contact });
    if (request.body.username) {
      user3 = await User.findOne({ username: request.body.username });
    }
    return response.json({
      email: user1 !== null,
      contact: user2 !== null,
      username: user3 !== null,
    });
  } catch (error) {
    console.log("Error : ", error);
  }
};

// User Login
export const userLogin = async (request, response) => {
  try {
    console.log("check");
    var userData = await User.findOne({
      secondaryEmails: request.body.username,
    });
    console.log(userData);
    if (userData) {
      return response.status(400).json({
        msg: "You can not login with secondary email",
        email: request.body.username,
      });
    }
    var user = await User.findOne({ email: request.body.username });
    if (user == null) {
      user = await User.findOne({ username: request.body.username });
    }
    if (user == null) {
      user = await User.findOne({ contact: request.body.username });
    }
    let correctuser = false;
    if (user) {
      correctuser = passwordHash.verify(request.body.password, user.password);
    }
    // console.log(request.body.username);
    // console.log(request.body);
    if (user && correctuser) {
      const token = await axios.post(`${url}/generateToken`, { user: user.id });
      const access_token = token.data.token;
      let ussrr = await User.findOneAndUpdate({ _id: user._id.toString()}, { access_token: access_token, access_valid: true });
      return response
        .status(200)
        .json({ access_token: access_token, user: ussrr });
    } else {
      return response.status(401).json("Invalid Login!");
    }
  } catch (error) {
    return response.status(401).json(`Error : ${error.message}`);
  }
};

// Signup For User Using Email
export const userSignup = async (request, response) => {
  try {
    // console.log(request.body);

    let userData = await User.findOne({
      $or: [
        {
          secondaryEmails: request.body.email,
        },
        {
          secondaryContacts: request.body.contact,
        },
      ],
    });

    if (userData) {
      return response
        .status(400)
        .json({ msg: "Email/Contact already registered" });
    }

    const candidate = await Candidate.findOne({ email: request.body.email });
    let name = String(request.body.name).split(" ");
    let firstname = name[0];
    let lastname = name.slice(1).join(" ");
    let temp_acc = v4();
    let password = passwordHash.generate(request.body.password);
    let cc = request.body.countryCode.split("-");
    let country = cc[1];
    let countryCode = cc[0];
    // console.log(cc);
    let user1 = {
      username: request.body.username,
      email: request.body.email,
      contact: request.body.contact,
      firstName: firstname,
      lastname: lastname,
      password: password,
      user_type: request.body.user_type,
      access_token: temp_acc,
      job_invitations: candidate ? [candidate.jobId] : [],
      language: request.body.user_type,
      showComName: request.body.showComName,
      showComLogo: request.body.showComLogo,
      showEducation: request.body.showEducation,
      showContact: request.body.showContact,
      showEmail: request.body.showEmail,
      country: country,
      countryCode: countryCode,
      status: request.body.user_type === "XI" ? "Pending" : "User",
    };





    const newUser = new User(user1);
    await newUser.save();

    if (!candidate) {












      if (request.body.user_type == "User" || request.body.user_type == "XI") {
        const CandidadeCount = await Candidate.count();
        const candidateInfo = {
          email: newUser.email,
          phoneNo: newUser.contact,
          firstName: firstname,
          lastName: lastname,
          candidate_id: CandidadeCount + 1,
          jobId: "",
        }






        let newCandidate = new Candidate(candidateInfo);
        await newCandidate.save();
      }
    }




    const creditInfo ={
      userId: newUser._id,
    }
    let user_creditInfo = new userCredit_info(creditInfo);
    await user_creditInfo.save();


    

    if (request.body.user_type === "XI") {
      const candidateInfo = {
        candidate_id: newUser._id,

      }
      let xi = new xi_info(candidateInfo);
      await xi.save();
    }


    const token = await axios.post(`${url}/generateToken`, {
      user: newUser.id,
    });
    // console.log(token);
    let access_token = token.data.token;

    let ussrr = await User.findOneAndUpdate({ _id: newUser._id.toString()}, { access_token: access_token, access_valid: true });

    let html = `<div>Hi ${request.body.username}</div>,
    <div>Welcome to Value Matrix. It is a great pleasure to have you on board</div>.
    <div>Our mission is to mission_statement .</div>
    <div>Regards,</div>
    <div>Value  Matrix</div>`;

    await sendGridMail.send({
      to: request.body.email,
      from: "developervm171@gmail.com",
      subject: "Value Matrix Sign Up",
      html: html,
    });
    if (ussrr) {
      return response
        .status(200)
        .json({ user: ussrr, access_token: token.data.token });
    } else {
      return response.status(401).json("Invalid Signup!");
    }
  } catch (error) {
    return response.status(401).json(`Error : ${error.message}`);
  }
};

// Get User From Id
export const getUserFromId = async (request, response) => {
  try {
    User.findById(request.body.id, async function (err, res) {
      if (res) {
        // console.log(res);
        return response.status(200).json({ user: res });
      }
      response.status(403).json({ Message: "User Not Found" });
    });
  } catch (error) {
    console.log("Error :", error);
  }
};
export const getUser = async (request, response) => {
  try {
    User.findById(request.body.id, async function (err, res) {
      if (res) {
        // console.log(res);
        return response.status(200).json({ user: res });
      }
      response.status(403).json({ Message: "User Not Found" });
    });
  } catch (error) {
    console.log("Error :", error);
  }
};

// Get country
export const fetchCountry = async (request, response) => {
  try {
    // let res = await country.find({});
    // console.log("hii");
    // console.log(res);
    await Country.find({})
      .collation({ locale: "en" })
      .sort({ country: 1 })
      .exec(function (err, countries) {
        if (err) return console.error(err);
        //console.log(countries);

        return response.status(200).json({ countries });
      });
  } catch (error) {
    console.log("Error :", error);
  }
};
export const getCountryList = async (request, response) => {
  try {
    // let res = await country.find({});
    // console.log("hii");
    // console.log(res);
    await AddCountry.find({})
      .collation({ locale: "en" })
      .sort({ country: 1 })
      .exec(function (err, countries) {
        if (err) return console.error(err);
        //console.log(countries);

        return response.status(200).json({ countries });
      });
  } catch (error) {
    console.log("Error :", error);
  }
};

export const getProfileImg = async (request, response) => {
  {
    try {
      User.findById(request.body.id, async function (err, res) {
        if (res && res.access_valid) {
          if (res.profileImg) {
            console.log(res.profileImg);

            let path_url = "./media/profileImg/" + res.profileImg;
            let d = await fs.readFileSync(
              path.resolve(path_url),
              {},
              function (err, res) { }
            );
            // console.log(d)
            return response.status(200).json({ Image: d });
          } else {
            return response.status(400).json({ Message: "No Profile Image" });
          }
        }

        return response.status(403).json({ Message: "User Not Found" });
      });
    } catch (error) {
      console.log("Error : ", error);
    }
  }
};
// Update User Profile
export const updateUserDetails = async (request, response) => {
  try {
    let validate = await axios.post(
      `${url}/validateSignup`,
      request.body.updates
    );
    if (validate.data.email) {
      return response.json({
        Error: "Email already registered",
        contact: 0,
        email: 1,
      });
    }
    if (validate.data.contact) {
      return response.json({
        Error: "Contact already registered",
        contact: 1,
        email: 0,
      });
    }



    User.findOne({ _id: request.body.user_id }, function (err, res) {
      if (res.access_valid === false) return response.status(403);
    });
    let user1 = await User.findOneAndUpdate(
      { _id: request.body.user_id },
      request.body.updates,
      { new: true }
    );
    console.log("user1", user1);
    response.status(200).json({ user: user1 });
  } catch (error) {
    console.log("update Error, ", error);
  }
};

// Update Profile Picture
export const updateProfileImage = async (req, response) => {
  try {
    User.findOne({ _id: req.body.user_id }, async function (err, user) {
      let user_type = req.query.user;
      console.log(user_type);
      if (user_type === "User") {
        let path_url = IMAGEPATH + req.file.filename;
        console.log("path_url", path_url);
        const options = {
          method: "POST",
          url: "https://face-detection6.p.rapidapi.com/img/face",
          headers: {
            "content-type": "application/json",
            "X-RapidAPI-Key":
              "8f063108cfmsh3aa100a3fcfbaacp154179jsnb2004b15c7fc",
            "X-RapidAPI-Host": "face-detection6.p.rapidapi.com",
          },
          data: { url: path_url, accuracy_boost: 2 },
        };

        let profileData = await axios.request(options);

        if (profileData.data.detected_faces.length == 0) {
          return response.status(200).json({ Message: "No Faces Found" });
        } else if (profileData.data.detected_faces.length != 1) {
          return response
            .status(200)
            .json({ Message: "More than one faces Found" });
        }
      }

      let str = user._id + "-profileImg.png";
      user.profileImg = str;
      await user.save();

      //console.log(user);
      return response.status(200).json({ Success: true });
    });
  } catch (error) {
    return response.status(400).send(error);
  }
};

// Logout
export const logout = async (req, response) => {
  try {
    await User.findOne({ _id: req.body.user_id }, function (err, res) {
      if (res) {
        res.access_valid = false;
        res.save();
      }
    }).clone();
    response.status(200);
    response.send("success");
  } catch (error) {
    console.log("Error : ", error);
  }
};

// Candidate Resume Upload
export const uploadCandidateResume = async (req, response) => {
  try {
    User.findOne({ _id: req.body.user_id }, async function (err, user) {
      let str = user._id + "-resume";
      user.resume = str;
      await user.save();

      let path_url = "./media/resume/" + req.body.user_id + "-resume";
      let buffer = await fs.readFileSync(path.resolve(path_url));
      var base64Doc = buffer.toString("base64");
      var modifiedDate = new Date().toISOString().substring(0, 10);
      var postData = JSON.stringify({
        DocumentAsBase64String: base64Doc,
        DocumentLastModified: modifiedDate,
      });

      var options = {
        url: "https://rest.resumeparsing.com/v10/parser/resume",
        method: "POST",
        headers: {
          "Sovren-AccountId": "25792885",
          "Sovren-ServiceKey": "3udxhUZvj/XEb7DXkX2bkLaLcB8hzaqyfz7DZ2z+",
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
        },
        data: postData,
      };
      const ResumeParseData = await axios.request(options);

      if (
        ResumeParseData.data &&
        ResumeParseData.data.Info.Code === "Success"
      ) {
        let resumeData = ResumeParseData.data.Value.ResumeData;
        profileData.firstName =
          resumeData.ContactInformation.CandidateName.FormattedName;
        if (resumeData.ContactInformation.EmailAddresses[0] != user.email) {
          let arr = [];
          arr.push(resumeData.ContactInformation.EmailAddresses[0]);
          profileData.secondaryEmails = arr;
        } else {

          profileData.email = resumeData.ContactInformation.EmailAddresses[0];
        }

        // profileData.contact = resumeData.ContactInformation.Telephones[0].Raw;

        if (resumeData.ContactInformation.Telephones[0].Raw != user.contact) {
          let arr = [];
          arr.push(resumeData.ContactInformation.Telephones[0].Raw);
          profileData.secondaryContacts = arr;
        } else {

          profileData.contact = resumeData.ContactInformation.Telephones[0].Raw;
        }


        console.log(resumeData.ContactInformation.Location.StreetAddressLines);
        profileData.address = resumeData.ContactInformation.Location
          ? resumeData.ContactInformation.Location.StreetAddressLines[0]
          : "";


        let linkedIn = resumeData.ContactInformation.WebAddresses
          ? resumeData.ContactInformation.WebAddresses.filter(
            (obj) => obj.Type == "LinkedIn"
          )
          : [];
        profileData.linkedInId =
          linkedIn && linkedIn.length > 0 ? linkedIn[0].Address : "";
        profileData.resume = user._id + "-resume";

        if (resumeData.Education && resumeData.Education.EducationDetails) {
          for (
            let i = 0;
            i < resumeData.Education.EducationDetails.length;
            i++
          ) {
            const edu = resumeData.Education.EducationDetails[i];
            let EduObj = {
              school: edu.SchoolName.Raw,
              degree: edu.Degree.Name.Raw,
              field_of_study: edu.Majors ? edu.Majors[0] : "",
              start_date: "",
              end_date: edu.LastEducationDate.Date,
              grade: edu.GPA ? edu.GPA.Score : "",
              description: null,
              Ispresent: edu.LastEducationDate.IsCurrentDate,
            };
            profileData.education.push(EduObj);
          }
        }

        if (
          resumeData.EmploymentHistory &&
          resumeData.EmploymentHistory.Positions
        ) {
          for (
            let i = 0;
            i < resumeData.EmploymentHistory.Positions.length;
            i++
          ) {
            const experience = resumeData.EmploymentHistory.Positions[i];
            let experienceObj = {
              title: experience.JobTitle ? experience.JobTitle.Raw : "",
              company_name: experience.Employer
                ? experience.Employer.Name.Raw
                : "",
              location: "",
              start_date: experience.StartDate ? experience.StartDate.Date : "",
              end_date: experience.EndDate ? experience.EndDate.Date : "",
              industry: "",
              description: experience.Description,
              Ispresent: experience.EndDate
                ? experience.EndDate.IsCurrentDate
                : "",
            };
            profileData.experience.push(experienceObj);
            profileData.associate.push(experienceObj);
          }
        }

        if (resumeData.Skills && resumeData.Skills.Raw) {
          for (let i = 0; i < resumeData.Skills.Raw.length; i++) {
            const skills = resumeData.Skills.Raw[i];
            let toolsObj = {
              _id: "",
              primarySkill: skills.Name,
              secondarySkill: "",
              role: "",
              proficiency: "0",
            };
            profileData.tools.push(toolsObj);
          }
        }

        if (resumeData.LanguageCompetencies) {
          for (let i = 0; i < resumeData.LanguageCompetencies.length; i++) {
            const languages = resumeData.LanguageCompetencies[i];
            let lanObj = {
              name: languages.Language,
              read: false,
              write: false,
              speak: true,
            };
            profileData.language.push(lanObj);
          }
        }
      } else {
        return response
          .status(400)
          .json({ Success: false, data: "Resume parsing is failed" });
      }
      return response.status(200).json({ Success: true, data: profileData });
    });
  } catch (error) {
    console.log("Error : ", error);
    return response.status(400).json(error);
  }
};

// Submit Candidate Resume Details
export const submitCandidateResumeDetails = async (req, response) => {
  try {
    console.log(req.body);
    await User.findOne({ _id: req.body.user_id }, async function (err, user) {
      if (user === null) return response.status(403);
      if (req.body.education) {
        user.education = req.body.education;
      }
      if (req.body.experience) {
        user.experience = req.body.experience;
      }
      if (req.body.houseNo) {
        user.houseNo = req.body.houseNo;
      }
      if (req.body.street) {
        user.street = req.body.street;
      }
      if (req.body.city) {
        user.city = req.body.city;
      }

      if (req.body.country) {
        user.country = req.body.country;
      }
      if (req.body.state) {
        user.state = req.body.state;
      }
      if (req.body.zip) {
        user.zip = req.body.zip;
      }
      if (req.body.associate) {
        user.associate = req.body.associate;
      }
      if (req.body.language) {
        user.language = req.body.language;
      }
      if (
        (user.contact === user.googleId ||
          user.contact === user.microsoftId ||
          user.contact === user.linkedInId ||
          user.contact === user.githubId) &&
        req.body.contact &&
        req.body.contact.contact
      ) {
        user.contact = req.body.contact.contact;
      }
      if (req.body.tools) {
        let tools = user.tools ? user.tools : [];
        tools = tools.concat(req.body.tools);
        user.tools = tools;
      }

      await user.save();

      return response.status(200).json({ Success: true, user: user });
    }).clone();
  } catch (error) {
    console.log("Error : ", error);
  }
};

// Submit Company Resume Details
export const submitCompanyDetails = async (req, response) => {
  try {
    User.findOne({ _id: req.body.user_id }, async function (err, user) {
      user.desc = req.body.about;
      // user.experience =req.body.experience;
      // user.address = req.body.contact.address;
      user.city = req.body.city;
      user.country = req.body.country;
      user.street = req.body.street;
      user.state = req.body.state;
      user.zip = req.body.zip;
      user.houseNo = req.body.houseNo;

      user.tools = req.body.tools;
      await user.save();
      return response.status(200).json({ Success: true, user: user });
    });
  } catch (error) {
    console.log("Error : ", error);
  }
};

// Get User From Reset Pass ID
export const getUserInviteFromResetPassId = async (request, response) => {
  try {
    User.findOne(
      { resetPassId: request.body.reset_id },
      async function (err, res) {
        if (res) {
          return response.status(200).json({
            user_invite: res.invite,
            email: res.email,
            contact: res.contact,
          });
        }
        response.status(403).json({ Message: "User Not Found" });
      }
    );
  } catch (error) {
    console.log("Error :", error);
  }
};

// Set Profile

export const setProfile = async (request, response) => {
  try {
    User.findOne(
      { resetPassId: request.body.reset_pass_id },
      async function (err, user) {
        if (
          user.resetPassId &&
          user.resetPassId === request.body.reset_pass_id
        ) {
          user.username = request.body.username;
          user.password = passwordHash.generate(request.body.password);
          const token = await axios.post(`${url}/generateToken`, {
            user: user.id,
          });
          const access_token = token.data.token;
          user.access_token = access_token;
          user.access_valid = true;
          user.invite = false;
          await user.save();
          return response
            .status(200)
            .json({ Success: true, access_token: access_token });
        }
        return response.status(403);
      }
    );
  } catch (error) {
    console.log("Error : ", error);
  }
};


// Get Job Invitations
export const getJobInvitations = async (request, response) => {
  try {
    await User.findOne(
      { _id: request.body.user_id },
      async function (err, user) {
        if (user) {
          let jobInvites = await Job.find({
            _id: { $in: user.job_invitations},
          }).clone();
          return response.status(200).json({ jobInvites: jobInvites });
        }
        return response.status(403);
      }
    ).clone();
  } catch (error) {
    console.log("Error : ", error);
  }
};



// Handle Candidate Job Invitation
export const handleCandidateJobInvitation = async (request, response) => {
  try {
    console.log(request.body);
    await Job.findOne({ _id: request.body.job_id }, async function (err, job) {
      if (job) {
        await User.findOne(
          { _id: request.body.user_id },
          async function (err, user) {
            if (user) {
              if (request.body.accept) {
                let e = user.job_invitations.filter(
                  (item) => item !== request.body.job_id
                );
                user.job_invitations = e;
                let d = job.applicants ? job.applicants : [];
                d.push(user._id);
                job.applicants = d;
                let newInterview = new Interview({
                  job: request.body.job_id,
                  applicant: user._id,
                  interviewers: request.body.interviewers
                });
                await newInterview.save();
                await user.save();
                await job.save();
                console.log(newInterview)


                return response.status(200).json({ Success: true, data: newInterview });
              } else {
                user.job_invitations = user.job_invitations.filter(
                  (item) => item !== request.body.job_id
                );
                let d = job.invitations_declined
                  ? job.invitations_declined
                  : [];
                d.push(user._id);
                job.invitations_declined = d;
                await job.save();
                await user.save();
                return response.status(200).json({ Success: true });
              }
            }
            return response.status(403);
          }
        ).clone();
      }
      return response.status(403);
    }).clone();
  } catch (err) {
    console.log(err);
  }
};

// Approve company
export const approveCompany = async (req, res) => {
  try {
    const jobData = await UserBin.findOne({
      _id: req.body._id,
      user_type: "Company",
    }).lean();
    delete jobData._id;
    delete jobData.__v;
    const newJob = new User(jobData);
    await newJob.save();
    await UserBin.findOneAndDelete({ _id: req.body._id });
    res.send();
  } catch (err) {
    console.log("Error approveJob: ", err);
    res.send(err);
  }
};

// list of unapproved jobs
export const listOfUnapproveCompanies = async (req, res) => {
  try {
    const jobData = await UserBin.find({ user_type: "Company" });
    res.send(jobData);
  } catch (err) {
    console.log("Error listOfUnapproveCompanies: ", err);
    res.send(err);
  }
};

export const handleXIInterview = async (request, response) => {
  try {
    console.log(request.body);



    let newInterview = new XIInterview({
      slotId: request.body.slotId,
      applicant: request.body.applicant,
      interviewer: request.body.interviewer,
      status: request.body.status,
    });
    await newInterview.save();

    console.log(newInterview)


    return response.status(200).json({ Success: true, data: newInterview });





  } catch (err) {
    console.log(err);
  }
};
