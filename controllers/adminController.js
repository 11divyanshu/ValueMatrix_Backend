import User from "../models/userSchema.js";
import axios from "axios";
import passwordHash from "password-hash";
import { } from "dotenv/config";
import fs from "fs";
import path from "path";
import Country from "../models/countrySchema.js";

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
export const getXIList = async (request, response) => {
  try {
    console.log(request.body)
    await User.findOne({ _id: request.body.user_id }, function (error, res) {
      console.log(res);
      if (res && res.permissions[0].admin_permissions.list_XI === false) {
        return response.status(403).json("You cannot view XI");
      }
    }).clone();
    await User.find({ user_type: "User",status:"Pending" }, function (err, res) {
      return response.status(200).json(res);
    }).clone();
  } catch (error) {
    return response.status(401).json(`Error : ${error.message}`);
  }
};

export const getXIUserList = async (request, response) => {
  try {
    console.log(request.body)
    await User.findOne({ _id: request.body.user_id }, function (error, res) {
      console.log(res);
      if (res && res.permissions[0].admin_permissions.list_XI === false) {
        return response.status(403).json("You cannot view XI");
      }
    }).clone();
    await User.find({ user_type: "XI",status:"Approved" }, function (err, res) {
      return response.status(200).json(res);
    }).clone();
  } catch (error) {
    return response.status(401).json(`Error : ${error.message}`);
  }
};
export const getSuperXIUserList = async (request, response) => {
  try {
    console.log(request.body)
    await User.findOne({ _id: request.body.user_id }, function (error, res) {
      console.log(res);
      if (res && res.permissions[0].admin_permissions.list_XI === false) {
        return response.status(403).json("You cannot view SuperXI");
      }
    }).clone();
    await User.find({ user_type: "SuperXI"}, function (err, res) {
      return response.status(200).json(res);
    }).clone();
  } catch (error) {
    return response.status(401).json(`Error : ${error.message}`);
  }
};

export const postXIUserLevel = async (request, response) => {
  try {
    let statusData = await User.findOneAndUpdate({ _id: request.body.user_id }, { $set: { level: request.body.level } }, { new: true })
    
    if (statusData.level === request.body.level) {
      response.send({ data: "update successfully" }).status(200);
    } else {
      response.send({ data: "status not updated!" }).status(400);
    }
  }
  catch (err) {
    res.send({ data: "something went wrong", err }).status(400);
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
export const downloadResume = async (request, response) => {
  try {
    User.findOne({ _id: request.body.user_id }, async function (err, user) {
      let path_url = "./media/resume/" + user.resume;
      let d = await fs.readFileSync(
        path.resolve(path_url),
        {},
        function (err, res) { }
      );
      let url1 = url + "/media/resume/" + user.resume;
      return response.json({ Resume: d, link: url1 });
    }).clone();
  } catch (error) {
    console.log("Error : ", error);
  }
};

// Add Admin User
export const addAdminUser = async (request, response) => {
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
      if (res && res.isAdmin === false) {
        return response
          .status(401)
          .json("Request User Not Registered as a Company");
        return;
      }
      if (
        res &&
        res.user_type === "Admin_User" &&
        res.permissions[0] &&
        res.permissions[0].admin_permissions.add_admin_user === false
      ) {
        return response
          .status(401)
          .json("You are not allowed to add admin user");
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
    let newUser = new User({
      email: request.body.email,
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      username: request.body.username,
      isAdmin: true,
      contact: request.body.contact,
      password: passwordHash.generate(request.body.password),
      user_type: "Admin_User",
      permissions: [
        { company_permissions: null, admin_permissions: permission },
      ],
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

// add Tax ID 

export const addTaxId = async (request, response) => {
  try {
    console.log(request.body);

    //  await Country.insert({country : request.body.data})
    var user = new Country({
      country: request.body.data.country,
      tax_id: request.body.data.tax_id,
    });

    user.save(async function (err, results) {

      console.log(results._id);
      await Country.find({}).collation({ locale: "en" }).sort({ country: 1 }).exec(function (err, countries) {

        if (err) return console.error(err);
        // console.log(countries);
  
        return response.status(200).json({ countries });
      })

    });

  }catch (error) {
  console.log(error);
}
}

export const findAndUpdateTax = async (request, response) => {
  try {

    let tax_id = request.params.id;
    console.log(tax_id);
    console.log(request.body);
  
    Country.findOne({ _id: tax_id }, async function (err, countries) {
      countries.country = request.body.data.country;
      countries.tax_id = request.body.data.tax_id;
      await countries.save();

      await Country.find({}).collation({ locale: "en" }).sort({ country: 1 }).exec(function (err, countries) {

        if (err) return console.error(err);
        // console.log(countries);
  
         return response.status(200).json({ countries });
      })
      // return response.status(200).json({ Success: true, country: country });
    });
   
  } catch (error) {
    
  }
}

export const findAndDeleteTax = async (request, response) => {
  try {

    let tax_id = request.params.id;
    console.log(tax_id);
    
    Country.findOneAndDelete({_id: tax_id},async function(err ,res){
console.log("delete");
      await Country.find({}).collation({ locale: "en" }).sort({ country: 1 }).exec(function (err, countries) {

        if (err) return console.error(err);
        console.log(countries);
  
         return response.status(200).json({ countries });
      })

    });

  }catch(err){
    console.log(err);


  }
}
