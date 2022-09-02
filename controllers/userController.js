import User from "../models/userSchema.js";
import axios from "axios";
import passwordHash from "password-hash";
import {} from "dotenv/config";
import Job from "../models/jobSchema.js";
import Interview from "../models/interviewApplicationSchema.js";
import multer from "multer";
import fs from "fs";
import sendGridMail from "@sendgrid/mail";
import FormData from "form-data";
import path from "path";

const url = process.env.BACKEND_URL;
const front_url = process.env.FRONTEND_URL;
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
    if (user && correctuser) {
      const token = await axios.post(`${url}/generateToken`, { user: user.id });
      const access_token = token.data.token;
      user.access_token = access_token;
      user.access_valid = true;
      await user.save();
      return response
        .status(200)
        .json({ access_token: access_token, user: user });
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
    let name = String(request.body.name).split(" ");
    let firstname = name[0];
    let lastname = name.slice(1).join(" ");

    let password = passwordHash.generate(request.body.password);
    let user1 = {
      username: request.body.username,
      email: request.body.email,
      contact: request.body.contact,
      firstName: firstname,
      lastname: lastname,
      password: password,
      user_type: request.body.user_type,
    };

    const newUser = new User(user1);
    await newUser.save();
    const token = await axios.post(`${url}/generateToken`, {
      user: newUser.id,
    });

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
    if (newUser) {
      return response
        .status(200)
        .json({ user: newUser, access_token: token.data.token });
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
        return response.status(200).json({ user: res });
      }
      response.status(403).json({ Message: "User Not Found" });
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
          let path_url = "./media/profileImg/" + res.profileImg;
          let d = await fs.readFileSync(
            path.resolve(path_url),
            {},
            function (err, res) {}
          );
          return response.json({ Image: d });
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
    response.status(200).json({ user: user1 });
  } catch (error) {
    console.log("Error, ", error);
  }
};

// Update Profile Picture
export const updateProfileImage = async (req, response) => {
  try {
    User.findOne({ _id: req.body.user_id }, async function (err, user) {
      let str = user._id + "-profileImg";
      user.profileImg = str;
      await user.save();
      return response.status(200).json({ Success: true });
    });
  } catch (error) {
    console.log("Error : ", error);
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
      return response.status(200).json({ Success: true });
    });
  } catch (error) {
    console.log("Error : ", error);
  }
};

// Submit Candidate Resume Details
export const submitCandidateResumeDetails = async (req, response) => {
  try {
    User.findOne({ _id: req.body.user_id }, async function (err, user) {
      if (req.body.education) {
        user.education = req.body.education;
      }
      if (req.body.experience) {
        user.experience = req.body.experience;
      }
      if (req.body.contact && req.body.contact.address) {
        user.address = req.body.contact.address;
      }
      if (
        (user.contact === user.googleId ||
          user.contact === user.microsoftId ||
          user.contact === user.linkedInId ||
          user.contact === user.githubId) &&
        req.body.contact.contact
      ) {
        user.contact = req.body.contact.contact;
      }
      if (req.body.tools) {
        user.tools = req.body.tools;
      }
      await user.save();
      return response.status(200).json({ Success: true, user: user });
    });
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
      user.address = req.body.contact.address;
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
          return response.status(200).json({ user_invite: res.invite });
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
        console.log(user);
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
            _id: { $in: user.job_invitations },
          }).clone();
          console.log(user);
          console.log(jobInvites);
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
    await Job.findOne({ _id: request.body.job_id }, async function (err, job) {
      if (job) {
        await User.findOne(
          { _id: request.body.user_id },
          async function (err, user) {
            console.log("User : ", user);
            console.log("Job : ", job);
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
                });
                await newInterview.save();
                await user.save();
                await job.save();
                return response.status(200).json({ Success: true });
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
    });
  } catch (err) {
    console.log(err);
  }
};
