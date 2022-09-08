import User from "../models/userSchema.js";
import passwordHash from "password-hash";
import sendGridMail from "@sendgrid/mail";
import v4 from "uuid/v4.js";
import {} from "dotenv/config.js";
import user from "../models/userSchema.js";
import unirest from "unirest";

var req = unirest("GET", "https://www.fast2sms.com/dev/bulkV2");

var fastsms_api = process.env.FAST2SMS_API_KEY;
const backend_url = process.env.BACKEND_URL;

let url = process.env.FRONTEND_URL;
sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

export const resetPasswordByEmail = async (request, response) => {
  try {
    await User.findOne(
      { email: request.body.contact },
      async function (err, res) {
        if (res === null || res === undefined) {
          response.json({ Message: "Email Not Registered !" });
        }

        let id = v4();
        res.resetPassId = id;
        await res.save();
        let html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Value Matrix Reset Password</a>
      </div>
      <p style="font-size:1.1em">Hi, ${res.firstName}</p>
      <p style="font-size:1.1em">There was a request to change your password!      </p>
      <br/>
      <p>If you did not make this request then please ignore this email.      </p>
      <p>Otherwise, please click this link to change your password: <a href="${url}/resetPassword/${id}">Link</a> </p>
    </div>
  </div>`;

        await sendGridMail.send({
          to: request.body.contact,
          from: "developervm171@gmail.com",
          subject: "Reset Password",
          html: html,
        });

        return response.status(200).json({ Message: "Mail Sent" });
      }
    ).clone();
  } catch (error) {
    console.log("Error :", error);
  }
};

export const resetPassword = async (request, response) => {
  try {
    User.findOne(
      { resetPassId: request.body.reset_id },
      async function (err, res) {
        if (res === undefined || res === null) response.status(403);
        let password = passwordHash.generate(request.body.password);
        res.password = password;
        res.resetPassId = null;
        await res.save();
        let html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
        <div style="margin:50px auto;width:70%;padding:20px 0">
          <div style="border-bottom:1px solid #eee">
            <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Value Matrix Reset Password</a>
          </div>
          <p style="font-size:1.1em">Hi, ${res.firstName}</p>
          <p style="font-size:1.1em">Your Password has been reset.</p>
          <br/>
        </div>
      </div>`;

        await sendGridMail.send({
          to: res.email,
          from: "developervm171@gmail.com",
          subject: "Reset Password",
          html: html,
        });
        return response.status(200).json({});
      }
    );
  } catch (error) {
    console.log("Error :", error);
  }
};

export const resetPasswordByContact = async (request, response) => {
  try {
    user.findOne({ contact: request.body.contact }, async function (err, res) {
      if (res === null || res === undefined) {
        return response.status(404).json({ Error: "Contact Not Registered !" });
      }

      let id = v4();
      res.resetPassId = id;
      await res.save();

      console.log(res);
      let text = `We have received a request to reset password. Open this link in browser : ${url}/resetPassword/${id}`;

      req.query({
        authorization: fastsms_api,
        message: text,
        route: "v3",
        numbers: request.body.contact,
      });
      req.headers({
        "cache-control": "no-cache",
      });
      req.end(function (res) {
        if (res.error) response.status(401).json({ Error: res.error });
        else response.status(200).json({});
      });
    });
  } catch (error) {
    console.log("Error : ", error);
  }
};

export const resetPasswordByUsername = async (request, response) => {
  try {
    await User.findOne(
      { username: request.body.contact },
      async function (err, res) {
        if (res === null || res === undefined) {
          response.json({ Error: "Email Not Registered !" });
        }
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(res.email)) {
          response.json({ Error: "Email Not Registered" });
          return;
        }
        let id = v4();
        res.resetPassId = id;
        await res.save();

        let html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Value Matrix Reset Password</a>
    </div>
    <p style="font-size:1.1em">Hi, ${res.firstName}</p>
    <p style="font-size:1.1em">There was a request to change your password!      </p>
    <br/>
    <p>If you did not make this request then please ignore this email.      </p>
    <p>Otherwise, please click this link to change your password: <a href="${url}/resetPassword/${id}">Link</a> </p>
  </div>
</div>`;

        await sendGridMail
          .send({
            to: res.email,
            from: "developervm171@gmail.com",
            subject: "Reset Password",
            html: html,
          })
          .then(() => {
            return response.status(200).json({});
          })
          .catch(() => {
            return response.status(401).json({ Error: "Email Not Found" });
          });
      }
    ).clone();
  } catch (error) {
    console.log("Error : ", error);
  }
};
