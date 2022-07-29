import mongoose from "mongoose";
import passport from 'passport';
import passportLocalMongoose from "passport-local-mongoose";
import findOrCreate from "mongoose-findorcreate";
import {Strategy as GoogleStrategy} from "passport-google-oauth20";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import { } from "dotenv/config";
import axios from 'axios';

const url = process.env.BACKEND_URL 

const userSchema = new mongoose.Schema({
    firstName :{
        type:String,
        trim : true,
        max:30,
    },
    lastname :{
        type:String,
        required: false,
        trim:true,
    },
    username :{
        type:String,
        required:true,
        trim:true,
        unique:true,
        index:true,
        lowercase:true,
    },
    email:{
      required:true,
        type:String,
        trim:true,
        lowercase:true,
        unique:true,
    },
    password:{
        type:String,
        required:false,
    },
    contact:{
        type:String,
        unique:true,
        required: true,
        default:null,
    },    
    googleId:{
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
    secret:{
      type: String,
      required: false,
    },
    access_token:{
      type:String,
      required: false,
      unique: true,
    },
    refresh_token:{
      type:String,
      required: false,
      unique: true,
    }
});

// Google Login
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const user = mongoose.model('user', userSchema);

// Google Login
passport.use(user.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  user.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${url}/auth/google/callback`,
  },  
  function(accessToken, refreshToken, profile, cb) {
    user.findOrCreate({ googleId: profile.id, username: profile.id, firstName: profile.name.givenName, lastName: profile.name.familyname, email:profile.id, contact:profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

// Google Login End

// Microsoft Login
passport.use(new MicrosoftStrategy({
  clientID: process.env.MICROSOFT_CLIENT_ID,
  clientSecret:process.env.MICROSOFT_CLIENT_SECRET,
  callbackURL: `${url}/auth/microsoft/callback`,
  scope: ['user.read'],
  tenant: 'common',
  authorizationURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
},
function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    let email = (profile.emails[0]? profile.emails[0].value : profile.id);
    let contact = profile._json.mobilePhone;
    if (contact === null)
      contact = profile.id;
    let username = profile.displayName ? profile.displayName : profile.id;
    user.findOrCreate({ microsoftId: profile.id, username: username, firstName: profile.name.givenName, lastName:profile.name.familyname,email : email, contact: contact }, function (err, user) {
      console.log(profile);
      return done(err,user)
  });
}
))

export default user;