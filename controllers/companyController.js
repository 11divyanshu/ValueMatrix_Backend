import User from "../models/userSchema.js";
import axios from "axios";
import passwordHash from "password-hash";
import {} from "dotenv/config";
import multer from "multer";
import fs from "fs";
import sendGridMail from "@sendgrid/mail";
import FormData from "form-data";
import path from "path";

const url = process.env.BACKEND_URL;
const front_url = process.env.FRONTEND_URL;
sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

export const addCompanyUser = async (request, response) => {
  try {
    if (
      request.body.company_id === null ||
      request.body.company_id === undefined
    ) {
      return response.json({
        success: false,
        message: "Company id is required",
      });
    }
    await User.findOne({ _id: request.body.company_id }, function (err, res) {
      if (err) {
        console.log(err);
        return response.status(401).json("Request User Not Found");
      }
      if (res && res.user_type !== "Company") {
        return response
          .status(401)
          .json("Request User Not Registered as a Company");
        return;
      }
    }).clone();
    let user = await User.findOne({ email: request.body.email });
    if (user) {
      return response.json({
        message: "User already exists",
      });
      return;
    }
    if (user == null) {
      user = await User.findOne({ username: request.body.username });
      if (user) {
        return response.json({
          message: "Username already exists",
        });
        return;
      }
    }
    if (user == null) {
      user = await User.findOne({ contact: request.body.contact });
      if (user) {
        return response.json({
          message: "Contact already exists",
        });
        return;
      }
    }
    let permission = {};
    request.body.permission.forEach((i) => {
      permission[i.id] = i.value;
    });
    console.log(permission);
    let newUser = new User({
      email: request.body.email,
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      username: request.body.username,
      contact: request.body.contact,
      password: passwordHash.generate(request.body.password),
      user_type: "Company_User",
      permissions: [permission],
      company_id: request.body.company_id,
    });
    await newUser.save();
    console.log(newUser);
    return response.json({
      message: "User added successfully",
      user: newUser,
    });
  } catch (error) {
    console.log("Error : ", error);
  }
};
