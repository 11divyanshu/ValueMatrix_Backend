import User from "../models/userSchema.js";
import axios from "axios";
import passwordHash from "password-hash";
import jwt from "jsonwebtoken";
import {} from "dotenv/config";
import verifyToken from "../middleware/auth.js";
import multer from "multer";
import {promises as fs} from "fs";
import path from "path";

const url = process.env.BACKEND_URL;
const front_url = process.env.FRONTEND_URL;

var storage = multer.memoryStorage({
  destination: (req, file, cb) => {
    cb(null, "media/profileImg");
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, file.filename + "-" + Date.now());
  },
});
var upload = multer({ storage: storage });

// Validate Signup details
export const vaildateSignupDetails = async (request, response) => {
  try {
    var user1 = await User.findOne({ email: request.body.email });
    var user2 = await User.findOne({ contact: request.body.contact });
    var user3 = await User.findOne({ username: request.body.username });
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
    let user1 = {};
    user1 = {
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

    if (newUser) {
      return response
        .status(200)
        .json(`${request.body.username} signup successfully !`);
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
    User.findById(request.body.id, function (err, res) {
      if (res && res.access_valid) {
        let image = res.profileImg.data.toString("base64");
        response.status(200).json({ user: res, profile: image });
        return;
      }
      response.status(403).json({ Message: "User Not Found" });
    });
  } catch (error) {
    console.log("Error :", error);
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
      request.body.updates
    );
    response.status(200).json({ user: user1 });
  } catch (error) {
    console.log("Error, ", error);
  }
};

// Update Profile Picture
export const updateProfileImage = async (req, res) => {
  try {
    User.findOne({ _id: req.body.user_id }, async function (err, user) {
      console.log(req)
      const image = {
        data: new Buffer.from(req.files[0].buffer, "base64"),
        contentType: req.files[0].mimetype,
      };
      user.profileImg = image;
      fs.writeFile(req.files[0].originalname, req.files[0].buffer, (err) => {
        if (err) {
            console.log('Error: ', err);
            res.status(500).send('An error occurred: ' + err.message);
          } else {
          user.save();
            res.status(200).send('ok');
        }});
      res.status(200).json({ Success: true });
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
  } catch (error) {
    console.log("Error : ", error);
  }
};
