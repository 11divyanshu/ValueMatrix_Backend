import User from "../models/userSchema.js";
import axios from "axios";
import passwordHash from "password-hash";
import {} from "dotenv/config";
import multer from "multer";
import fs from "fs";
import FormData from "form-data";
import path from "path";

const url = process.env.BACKEND_URL;
const front_url = process.env.FRONTEND_URL;

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
  console.log("signup");
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
    console.log(newUser);
    const token = await axios.post(`${url}/generateToken`, {
      user: newUser.id,
    });
    console.log(token);
    if (newUser) {
       return response.status(200).json({ user: newUser, access_token: token.data.token });
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
      if (res && res.access_valid) {
        return response.status(200).json({ user: res });
      }
      response.status(403).json({ Message: "User Not Found" });
    });
  } catch (error) {
    console.log("Error :", error);
  }
};

// GET Profile Image
// <<<<<<< HEAD
// export const getProfileImg = async(request ,response) => {
//   try {
//     User.findById(request.body.id, async function (err, res) {
//       if (res && res.access_valid) {
//         let path_url = 'https://backend.babyhost.in/media/profileImg/'+res.profileImg;
//         console.log(path_url);
//         let d = await fs.readFileSync(path.resolve("https://backend.babyhost.in/media/profileImg/62f373ab34a66ea1a2300f1e-profileImg"), {},function(err, res){
//           console.log("ERRO :", err);
//           console.log("Res : ", res);
//         })
//         return response.json({"Image": d});
//       }
//     }}
//   }
// =======
export const getProfileImg = async (request, response) => {
  {
    try {
      User.findById(request.body.id, async function (err, res) {
        if (res && res.access_valid) {
          let path_url = "./media/profileImg/" + res.profileImg;
          console.log(path_url);
          let d = await fs.readFileSync(
            path.resolve(path_url),
            {},
            function (err, res) {}
          );
          return response.json({ Image: d });
        }
// >>>>>>> 4bfe4419d5ea66b9cccad101e1b721a52ce27590

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
    console.log(request.body);
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
    console.log(user1);
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
  console.log(req.body);
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
