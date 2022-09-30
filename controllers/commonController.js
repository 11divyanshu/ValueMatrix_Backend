// const mongoose = require('mongoose')
// randomKey = require('random-key')

import mongoose from "mongoose";

let responseObj = {
  status: 500,
  message: "",
  data: null,
};

export const save = (m, o, c) => {
  mongoose.models[m].insertMany(o, (err, doc) => {
    if (!err && doc) {
      responseObj.status = 200;
      responseObj.message = "SAVED SUCCESSFULLY";
      responseObj.data = doc;
      return c(responseObj);
    } else {
      // // backup(m, o, err, 'save')
      responseObj.error = err;
      return c(responseObj);
    }
  });
};

export const update = (m, q, c) => {
  mongoose.models[m].findOneAndUpdate(
    q.f,
    q.u,
    { upsert: true, new: true },
    (err, doc) => {
      if (!err && doc) {
        responseObj.status = 200;
        responseObj.message = "UPDATED SUCCESSFULLY";
        responseObj.data = doc;
        return c(responseObj);
      } else {
        // // backup(m, q.u, err, 'update')
        responseObj.error = err;
        return c(responseObj);
      }
    }
  );
};

export const updateMany = (m, q, c) => {
  mongoose.models[m].updateMany(q.f, q.u, { upsert: true }, (err, doc) => {
    if (!err && doc) {
      responseObj.status = 200;
      responseObj.message = "UPDATED SUCCESSFULLY";
      responseObj.data = doc;
      return c(responseObj);
    } else {
      // backup(m, q.u, err, 'updateMany')
      responseObj.error = err;
      return c(responseObj);
    }
  });
};

export const read = (m, f, c) => {
  mongoose.models[m].find(f, (err, docs) => {
    if (!err && docs && docs.length > 0) {
      responseObj.status = 200;
      responseObj.message = "DATA FOUND";
      responseObj.data = docs;
      return c(responseObj);
    } else {
      responseObj.error = err;
      return c(responseObj);
    }
  });
};