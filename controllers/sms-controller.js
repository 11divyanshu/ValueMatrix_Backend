import unirest from "unirest";
import {} from 'dotenv/config';

var req = unirest("GET", "https://www.fast2sms.com/dev/bulkV2");

var fastsms_api = process.env.FAST2SMS_API_KEY

export const sendOTPSMS = async(request,response) => {
    try {
        console.log("SMS OTP 1");
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
        console.log("SMS OTP 2");
        console.log(OTP);
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