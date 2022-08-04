import User from "../models/userSchema.js";
import axios from "axios";
import passwordHash from "password-hash";
import {} from "dotenv/config";

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
