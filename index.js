import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { collectDefaultMetrics, register } from "prom-client";
import Connection from "./database/db.js";
import Routes from "./routes/routes.js";
import axios from "axios";
import session from "express-session";
import passport from "passport";
import User from "./models/userSchema.js";

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
let url = process.env.FRONTEND_URL;

// Token Generator
const getToken = async (user) => {
  let token = await axios.post(`${backend_url}/generateToken`, {
    user: user.id,
  });
  await User.findOne({ _id: user.id }, function (err, res) {
    if(!res || err)
      return null;
    res.access_token = token.data.token;
    res.access_valid = true;
    res.save();
  }).clone();
  return token;
};

// Google Auth

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile","email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${url}/login`,
  }),
 async function (req, res) {
    // Successful authentication, redirect secrets.
    const token = await getToken(req.user);
    res.cookie("access_token", token.data.token);
    if(req.user.isAdmin)
      res.redirect(`${url}/admin`);
    else
      res.redirect(`${url}/user`);
  }
);

// Goolge Auth

// Microsoft Auth
app.get(
  "/auth/microsoft",
  passport.authenticate("microsoft", {
    prompt: "select_account",
  })
);

app.get(
  "/auth/microsoft/callback",
  passport.authenticate("microsoft", { failureRedirect: "/login" }),
  async function (req, res) {
    const token = await getToken(req.user);
    await res.cookie("access_token", token.data.token);
    res.redirect(`${url}/user`);
  }
);
// Microsoft Auth

// LinkedIn Auth
app.get(
  "/auth/linkedin",
  passport.authenticate("linkedin", {
    scope: ["r_emailaddress", "r_liteprofile"],
  })
);

app.get(
  "/auth/linkedin/callback",
  passport.authenticate("linkedin", {
    failureRedirect: "/login",
  }),
  async function (req, res) {
    const token = await getToken(req.user);
    res.cookie("access_token", token.data.token);
    res.redirect(`${url}/user`);
  }
);

// LinkedIn Auth

app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server is running successfully on PORT ${PORT}`)
);

app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
const corsOptions ={
  origin:url, 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200
}
app.use(cors(corsOptions));
app.use("/", Routes);