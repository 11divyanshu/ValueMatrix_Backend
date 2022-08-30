import mongoose from "mongoose";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
import findOrCreate from "mongoose-findorcreate";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import { Strategy as GitHubStrategy } from "passport-github";
import {} from "dotenv/config";
import axios from "axios";

const url = process.env.BACKEND_URL;

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
    max: 30,
  },
  lastname: {
    type: String,
    required: false,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true,
    lowercase: true,
  },
  email: {
    required: true,
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  contact: {
    type: String,
    unique: true,
    required: true,
    default: null,
  },
  address: {
    type: String,
  },
  resume: {
    type: String,
  },
  education: {
    type: Array,
  },
  desc: {
    type: Array,
  },
  experience: {
    type: Array,
  },
  tools: {
    type: Array,
  },
  profileImg: {
    type: String,
  },
  about: {
    type: String,
  },
  timeRegistered: {
    type: Date,
    default: Date.now(),
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  googleId: {
    type: String,
    required: false,
  },
  linkedInId: {
    type: String,
    required: false,
  },
  microsoftId: {
    type: String,
    required: false,
  },
  githubId: {
    type: String,
    required: false,
  },
  user_type: {
    type: String,
    enum: ["Company", "User", "XI", "SuperXI", "Company_User", "Admin_User"],
  },
  company_id: {
    type: String,
  },
  permissions: {
    type: Array,
  },
  secret: {
    type: String,
    required: false,
  },
  access_token: {
    type: String,
    required: false,
  },
  access_valid: {
    type: Boolean,
    default: false,
  },
  resetPassId: {
    type: String,
    default: null,
  },
  invite: {
    type: Boolean,
    default: false,
  },
  job_invitations: {
    type: Array,
    default: [],
  },
});

// Google Login
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const user = mongoose.model("user", userSchema);

// Google Login
passport.use(user.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(async function (id, done) {
  const USER = await user.findById(id);
  done(null, USER);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${url}/auth/google/callback`,
    },
    async function (accessToken, refreshToken, profile, cb) {
      await user
        .findOne({ email: profile.emails[0].value }, async function (err, res) {
          let user1 = null;
          if (res === null) {
            user1 = await user.create({
              googleId: profile.id,
              username: profile.id,
              firstName: profile.name.givenName,
              lastName: profile.name.familyname,
              email: profile.emails[0].value,
              contact: profile.id,
            });
          } else if (res) {
            res.googleId = profile.id;
            res.save();
            user1 = res;
          }
          return cb(err, user1);
        })
        .clone();
    }
  )
);

// Google Login End

// Microsoft Login
passport.use(
  new MicrosoftStrategy(
    {
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: `${url}/auth/microsoft/callback`,
      scope: ["user.read"],
      tenant: "common",
      authorizationURL:
        "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    },
    async function (accessToken, refreshToken, profile, done) {
      let cont = true;
      let email = profile.emails[0] ? profile.emails[0].value : profile.id;
      let contact = profile._json.mobilePhone;
      if (contact === null) contact = profile.id;
      let username = profile.displayName ? profile.displayName : profile.id;
      await user
        .findOne({ email: email }, async function (err, res) {
          if (res) {
            res.microsoftId = profile.id;
            await res.save();
            cont = false;
            return done(err, res);
          } else {
            await user
              .Create(
                {
                  microsoftId: profile.id,
                  username: username,
                  firstName: profile.name.givenName,
                  lastName: profile.name.familyname,
                  email: email,
                  contact: contact,
                },
                function (err, user) {
                  return done(err, user);
                }
              )
              .clone();
          }
        })
        .clone();
    }
  )
);
// Microsoft Login End

// LinkedIn Auth
passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: `${url}/auth/linkedin/callback`,
      scope: ["r_emailaddress", "r_liteprofile"],
    },
    async function (token, tokenSecret, profile, done) {
      let email = profile.emails[0] ? profile.emails[0].value : profile.id;
      let contact = profile._json.mobilePhone;
      if (contact === null || contact === undefined) contact = profile.id;
      let username = profile.displayName;
      await user
        .findOne({ email: email }, async function (err, res) {
          if (res) {
            res.linkedInId = profile.id;
            await res.save();
            return done(err, res);
          } else {
            await user.findOrCreate(
              {
                linkedInId: profile.id,
                username: username,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                email: email,
                contact: contact,
              },
              function (err, res) {
                return done(err, res);
              }
            );
          }
        })
        .clone();
    }
  )
);
// LinkedIn Auth End

// Github Auth

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${url}/auth/github/callback`,
    },
    async function (accessToken, refreshToken, profile, done) {
      let cont = true;
      // console.log(profile);
      let email = profile._json.email ? profile._json.email : profile.id;
      let contact = profile._json.contact;
      if (contact === null || contact === undefined) contact = profile.id;
      let username = profile.username ? profile.username : profile.id;
      await user
        .findOne({ email: email }, async function (err, res) {
          if (res) {
            res.githubId = profile.id;
            await res.save();
            cont = false;
            return done(err, res);
          } else {
            await user.findOrCreate(
              {
                githubId: profile.id,
                username: username,
                firstName: profile.displayName,
                company: profile._json.company ? profile._json.company : "",
                email: email,
                about: profile._json.bio ? profile._json.bio : "",
                contact: contact,
              },
              function (err, user) {
                return done(err, user);
              }
            );
          }
        })
        .clone();
    }
  )
);
//Github Auth

export default user;
