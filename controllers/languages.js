import async from "async";
import languages from "../models/languages.js";
import mongoose from "mongoose";

export const addLanguages = (body, callback) => {
  try {
    languages.insertMany(body, (err, res) => {
      if (err) {
        callback(err, null);
      }
      callback(null, "Data saved  succesfully");
    });
  } catch (err) {
    callback(err, null);
  }
};

export const listOfLanguages = (req, callback) => {
    try {
      languages.find({}, (err, res) => {
        if (err) {
          callback(err, null);
        }
        callback(null, res);
      });
    } catch (err) {
      callback(err, null);
    }
  };