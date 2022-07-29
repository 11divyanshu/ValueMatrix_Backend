import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { collectDefaultMetrics, register } from "prom-client";
import Connection from "./database/db.js";
import Routes from "./routes/routes.js";
import axios from 'axios';
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
import { Strategy } from "passport-google-oauth20";
import findOrCreate from "mongoose-findorcreate";
import { generate } from "password-hash";

collectDefaultMetrics();

const app = express();
const PORT = 8000;

app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

Connection();
// collectDefaultMetrics({timeout:5000});
app.get("/metrics", async (_req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});


let backend_url = process.env.BACKEND_URL;
let url = process.env.FRONTEND_URL
// Token Generator

const getToken = async (user) => {
  let token = await axios.post(`${backend_url}/generateToken`, user);
  user.access_token = access_token;
  user.save();
  return token;
};

// Google Auth

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${url}`,
  }),
  async function (req, res) {
    // Successful authentication, redirect secrets.
    const token = await getToken(req.user);
    res.cookie('access_token', token.data.token);
    res.redirect(`${url}`);
  }
);
app.get("/logout", function (req, res) {
  res.redirect(`${url}`);
});

// Goolge Auth

// Microsoft Auth
app.get('/auth/microsoft',
      passport.authenticate('microsoft', {
        prompt: 'select_account',
      }));

    app.get('/auth/microsoft/callback', 
      passport.authenticate('microsoft', { failureRedirect: '/login' }),
      async function(req, res) {
        // const token = await getToken(req.user);
        // res.cookie('access_token', token.data.token);
        res.redirect(`${url}`);
      });
// Microsoft Auth

app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server is running successfully on PORT ${PORT}`)
);

app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use("/", Routes);
