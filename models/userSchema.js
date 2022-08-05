import mongoose from "mongoose";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
import findOrCreate from "mongoose-findorcreate";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
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
  profileImg: {
    data: Buffer,
    contentType: String,
  },
  timeRegistered:{
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
  secret: {
    type: String,
    required: false,
  },
  access_token: {
    type: String,
    required: false,
    unique: true,
  },
  access_valid: {
    type: Boolean,
    default: false,
  },
});

// Google Login
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const user = mongoose.model("user", userSchema);

// Google Login
passport.use(user.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  user.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${url}/auth/google/callback`,
    },
    function (accessToken, refreshToken, profile, cb) {
      user.findOne({ googleId: profile.id }, function (err, res) {
        let user1 = null;
        if (res === null) {
          user1 = user.create({
            googleId: profile.id,
            username: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyname,
            email: profile.id,
            contact: profile.id,
          });
        } else if (res) {
          user1 = res;
        }
        return cb(err, user1);
      });
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
    function (accessToken, refreshToken, profile, done) {
      let email = profile.emails[0] ? profile.emails[0].value : profile.id;
      let contact = profile._json.mobilePhone;
      if (contact === null) contact = profile.id;
      let username = profile.displayName ? profile.displayName : profile.id;
      user.findOrCreate(
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
      );
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
    function (token, tokenSecret, profile, done) {
      console.log(`${url}/auth/linkedin/callback`);
      let email = profile.emails[0] ? profile.emails[0].value : profile.id;
      let contact = profile._json.mobilePhone;
      if (contact === null || contact === undefined) contact = profile.id;
      let username = profile.displayName;
      let user1 = user.findOne({ username: profile.displayName });
      if (user1) username = profile.id;
      user.findOrCreate(
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
  )
);
// LinkedIn Auth End

export default user;