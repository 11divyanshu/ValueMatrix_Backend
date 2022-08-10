import unirest from "unirest";
import {} from 'dotenv/config';
import axios from "axios";
var req = unirest("GET", "https://www.fast2sms.com/dev/bulkV2");

var fastsms_api = process.env.FAST2SMS_API_KEY
const url =process.env.BACKEND_URL;

export const sendOTPSMS = async(request,response) => {
    try {
      console.log("OTP : ", request.body);
        var digits = "0123456789";
        let OTP = "";
        for (let i = 0; i < 6; i++) {
          OTP += digits[Math.floor(Math.random() * 10)];
        }
        req.query({
            "authorization": fastsms_api,
            "variables_values": OTP,
            "route": "otp",
            "numbers":request.body.contact,
        })
        req.headers({
            "cache-control" :"no-cache"
        })
        req.end(function(res){
            if(res.error) 
              response.status(401).json({"Error":res.error});
            else
              response.status(200).json({otp:OTP});
        })
      } catch (error) {
        console.log("Error : ", error);
      }
}

export const updateContactOTP = async(request,response) => {
    try {
      console.log(request.body);
      let validate = await axios.post(`${url}/validateSignup`, request.body.updates);
      if(validate.data.contact){
        return response.json({"Error":"Contact already registered", contact: 1, email : 0});
      }
        
        var digits = "0123456789";
        let OTP = "";
        for (let i = 0; i < 6; i++) {
          OTP += digits[Math.floor(Math.random() * 10)];
        }
        req.query({
            "authorization": fastsms_api,
            "variables_values": OTP,
            "route": "otp",
            "numbers":request.body.contact,
        })
        req.headers({
            "cache-control" :"no-cache"
        })
        req.end(function(res){
            if(res.error) 
              response.status(401).json({"Error":res.error});
            else
              response.status(200).json({otp:OTP});
        })
      } catch (error) {
        console.log("Error : ", error);
      }
}