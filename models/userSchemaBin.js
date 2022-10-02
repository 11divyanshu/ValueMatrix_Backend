import mongoose from "mongoose";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
import findOrCreate from "mongoose-findorcreate";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import { Strategy as GitHubStrategy } from "passport-github";
import v4 from "uuid/v4.js";
import {} from "dotenv/config";

const userBinSchema = new mongoose.Schema({
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
  secondaryEmails: {
    type: Array,
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
  secondaryContacts: {
    type: Array,
  },
  houseNo: {
    type: String,
  },
  street: {
    type: String,
  },
  city: {
    type: String,
  },
  country: {
    type: String,
  },
  state: {
    type: String,
  },
  zip: {
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
  billing: {
    type: Array,
  },
  experience: {
    type: Array,
  },
  associate: {
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
  linkedInUrl: {
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
  language: [
    {
      name: String,
      read: Boolean,
      write: Boolean,
      speak: Boolean,
    },
  ],
  showComName: {
    typr: Boolean,
  },
  showComLogo: {
    typr: Boolean,
  },
  showEducation: {
    typr: Boolean,
  },
  showContact: {
    typr: Boolean,
  },
  showEmail: {
    typr: Boolean,
  },
});

const userBin = mongoose.model("userBin", userBinSchema);

export default userBin;
