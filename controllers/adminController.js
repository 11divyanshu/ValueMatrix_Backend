import User from "../models/userSchema.js";
import axios from "axios";
import passwordHash from "password-hash";
import {} from "dotenv/config";
import fs from "fs";
import path from "path";
const url = process.env.BACKEND_URL;

// Admin Login
export const adminLogin = async (request, response) => {
  try {
    var user = await User.findOne({
      email: request.body.username,
      isAdmin: true,
    });
    if (user == null) {
      user = await User.findOne({
        username: request.body.username,
        isAdmin: true,
      });
    }
    if (user == null) { 
      user = await User.findOne({
        contact: request.body.username,
        isAdmin: true,
      });
    }
    let correctuser = false;
    if (user) {
      correctuser = passwordHash.verify(request.body.password, user.password);
    }
    if (!user.isAdmin) {
      return response.status(403);
    }
    if (user && correctuser) {
      let u = { user };
      const token = await axios.post(`${url}/generateToken`, { user: user.id });
      const access_token = token.data.token;
      user.access_token = access_token;
      user.save();
      return response.status(200).json({ access_token: access_token });
    } else {
      return response.status(401).json("Invalid Login!");
    }
  } catch (error) {
    return response.status(401).json(`Error : ${error.message}`);
  }
};

export const companyList = async (request, response) => {
  try {
    await User.findOne({ _id: request.body.user_id }, function (error, res) {
      console.log(res);
      if (res && res.isAdmin === false) {
        return response.status(403).json("You are not an admin");
      }
    }).clone();
    await User.find({ user_type: "Company" }, function (err, res) {
      return response.status(200).json({ company: res });
    }).clone();
  } catch (error) {
    return response.status(401).json(`Error : ${error.message}`);
  }
};

export const userList = async (request, response) => {
  try {
    await User.findOne({ _id: request.body.user_id }, function (error, res) {
      if (res && res.isAdmin === false) {
        return response.status(403).json("You are not an admin");
      }
    }).clone();
    await User.find({ user_type: "User" }, function (err, res) {
      return response.status(200).json({ user: res });
    }).clone();
  } catch (error) {
    return response.status(401).json(`Error : ${error.message}`);
  }
};

// Download Resume
export const downloadResume = async(request, response) => {
  try {
    User.findOne({ _id: request.body.user_id }, async function (err, user) {
      let path_url = "./media/resume/" + user.resume;
      let d = await fs.readFileSync(
        path.resolve(path_url),
        {},
        function (err, res) {}
      );
      let url1 = url + "/media/resume/" + user.resume;
      return response.json({ Resume: d, link : url1 });
    }).clone();
  } catch (error) {
    console.log("Error : ", error);
  }
}