import User from "../models/userSchema.js";
import axios from "axios";
import passwordHash from "password-hash";
import jwt from "jsonwebtoken";
import {} from "dotenv/config";
import e, { response } from "express";
import multer from "multer";

const url = process.env.BACKEND_URL;
const front_url = process.env.FRONTEND_URL;

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "media/profileImg");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
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
      let u = { user };
      const token = await axios.post(`${url}/generateToken`, { user: user.id });
      const access_token = token.data.token;
      user.access_token = access_token;
      user.access_valid = true;
      user.save();
      return response.status(200).json({access_token: access_token});
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

export const testAPI = async (req, res) => {
  try {
    jwt.verify(req.token, process.env.ACCESS_TOKEN_SECRET, (err, authData) => {
      if (err) {
        res.sendStatus(403);
      } else {
        // Refresh the token here
        console.log(authData);
      }
    });
    res.status(200).json({ MSG: "Passed" });
  } catch (error) {
    console.log("error");
  }
};

// Get User From Id
export const getUserFromId = async (request, response) => {
  try {
    User.findById(request.body.id, function (err, res) {
      if (res && res.access_valid) {
        response.status(200).json({ user: res });
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
    console.log(request.body.updates);
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
    var user1 = User.findOne({ _id: req.body.user_id }, function (err, user) {
      user.profileImg = {
        data: fs.readFileSync(path.join(req.file.path)),
        contentType: "image",
      };
      user.save();
      res.status(200);
    });
  } catch (error) {
    console.log("Error : ", error);
  }
};

// Logout
export const logout = async (req, response) => {
  try {
    await User.findOne({ _id: req.body.user_id }, function (err, res) {
      res.access_valid = false;
      res.save();
    }).clone();
    response.redirect(`${front_url}/login`);
  } catch (error) {
    console.log("Error : ", error);
  }
};