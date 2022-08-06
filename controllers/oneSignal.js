import https from "https";
import user from "../models/userSchema.js";

export const sendOneSignalNotification = async (request, response) => {
  try {

    await user.findOne({_id:request.body.user_id}, function(err,res){
        if(!res || err || res.isAdmin === false){
            response.status(403);
            return;
        }
    }).clone();
    
    var headers = {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: "Basic YmM3NmNmYmQtZjFlMS00YTRiLWIwZGUtZGU1NDg0ZmRkYWM0",
    };

    var options = {
      host: "onesignal.com",
      port: 443,
      path: "/api/v1/notifications",
      method: "POST",
      headers: headers,
    };

    let data = request.body.message;

    var req = https.request(options, function (res) {
      res.on("data", function (data) {
        
      });
    });

    req.on("error", function (e) {
      console.log("ERROR:");
    });

    req.write(JSON.stringify(data));
    req.end();

    response.status(200).json({"Message":"Notification Sent"});
  } catch (error) {
    console.log("Error : ", error);
  }
};