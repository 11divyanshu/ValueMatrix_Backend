import Notification from "../models/notificationSchema.js";
import User from "../models/userSchema.js";
import {} from "dotenv/config";
import sendGridMail from "@sendgrid/mail";

// Push Notifications To Database
export const pushNotification = async (request, response) => {
  try {
    console.log(request.body);
    User.findOne({ _id: request.body.user_id }, function (err, res) {
      if (!res || !res.isAdmin) response.status(403);
    });

    if (request.body.emailList && request.body.emailList.length > 0) {
      let query = User.find({ email: { $in: request.body.emailList } }).select(
        "_id"
      );
      let userIds = await query.exec();

      let noti = new Notification({
        title: request.body.title,
        message: request.body.message,
        sendTo: userIds.map((user) => user.id),
      });
      await noti.save();
      response.status(200).json({ message: "Notification Added" });
    } else {
      let forAll = null,
        user_type = null;
      if (request.body.forAll === "All") {
        forAll = true;
        user_type = ["All"];
      } else {
        forAll = false;
        user_type = request.body.forAll;
      }
      let noti = new Notification({
        title: request.body.title,
        message: request.body.message,
        forAll: forAll,
        user_type: user_type,
      });
      noti.save();
      response.status(200).json({ Message: "Notification Added" });
    }
  } catch (error) {
    console.log("Error : ", error);
  }
};

// Get Notifications For User
export const getUserNotification = async (request, response) => {
  try {
    Notification.find(
      {
        $or: [
          {
            forAll: true,
            hideFrom: { $ne: request.body.user_id },
            timeCreated: { $gte: request.body.user.timeRegistered },
            type: "Notification",
          },
          {
            forAll: false,
            user_type: request.body.user.user_type,
            hideFrom: { $ne: request.body.user_id },
            timeCreated: { $gte: request.body.user.timeRegistered },
            type: "Notification",
          },
          {
            forAll: true,
            sendTo: { $in: [request.body.user_id] },
            type: "Notification",
            hideFrom : { $ne: request.body.user_id },
          },
        ],
      },
      function (err, res) {
        if (res) {
          response.status(200).json({ notifications: res });
        } else response.json({ Error: "No Notification Found" });
      }
    );
  } catch (error) {
    console.log("Error : ", error);
  }
};

export const getAdminNotification = async (request, response) => {
  try {
    Notification.find(
      {
        $or: [
          {
            forAll: true,
            hideFrom: { $ne: request.body.user_id },
            timeCreated: { $gte: request.body.user.timeRegistered },
            type: "Notification",
          },
          {
            forAll: false,
            user_type: "Admin",
            hideFrom: { $ne: request.body.user_id },
            timeCreated: { $gte: request.body.user.timeRegistered },
            type: "Notification",
          },
        ],
      },
      function (err, res) {
        console.log(res);
        if (res) {
          response.status(200).json({ notifications: res });
        } else response.json({ Error: "No Notification Found" });
      }
    );
  } catch (error) {
    console.log("Error : ", error);
  }
  s;
};

// Mark Notification Read for User
export const markNotiReadForUser = async (request, response) => {
  try {
    Notification.findOne({ _id: request.body.noti_id }, function (err, res) {
      if (res) {
        let users = res.hideFrom;
        users.push(request.body.user_id);
        res.hideFrom = users;
        res.save();
        response.status(200).json({ Message: "Marked As Read" });
      } else {
        response.json({ Error: "Cannot Get Notification" });
      }
    });
  } catch (error) {
    console.log("Error : ", error);
  }
};

// Email Notifications
export const sendEmailNotification = async (request, response) => {
  try {
    User.findOne({ _id: request.body.user_id }, function (err, res) {
      if (err || res.isAdmin === false) {
        response.status(403);
        return;
      }
    });

    let query = null;
    let to = null;
    if (request.body.emailList.length === 0) {
      switch (request.body.sendTo) {
        case "All":
          query = User.find({}).select("email");
          break;
        case "User":
          query = User.find({ isAdmin: false }).select("email");
          break;
        case "Admin":
          query = User.find({ isAdmin: true }).select("email");
          break;
      }
      let noti = new Notification({
        forAll: request.body.sendTo === "All" ? true : false,
        title: request.body.subject,
        message: request.body.text,
        user_type: request.body.sendTo,
      });
      await noti.save();
      await query.exec(async function (err, res) {
        if (err) {
          response.json({ Error: "Cannot Send Mails" });
          return;
        }
        let email = [];
        res.map((item) => email.push(item.email));
        console.log(email);
        await sendGridMail
          .send({
            to: email,
            from: "developervm171@gmail.com",
            subject: request.body.subject,
            text: request.body.text,
          })
          .then(() => {
            console.log("Sent");
            return response
              .status(200)
              .json({ Message: "Emails Sent Successfully" });
          })
          .catch((err) => {
            console.log(err);
            console.log("Not Sent");
            return response.status(401).json({ Error: "Email Not Sent" });
          });
      });
    } else {
      to = request.body.emailList;
      let noti = new Notification({
        forAll: false,
        title: request.body.subject,
        message: request.body.text,
        sendTo: request.body.emailList,
      });
      await noti.save();
      await sendGridMail.send({
        to: to,
        from: "developervm171@gmail.com",
        subject: request.body.subject,
        text: request.body.text,
      });
    }
  } catch (err) {
    console.log(err);
  }
};
