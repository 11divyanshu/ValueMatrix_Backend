import contryCode from "../models/countryCodeSchema.js";

export const addCountryCodes = (body, callback) => {
  try {
    for (let i = 0; i < body.length; i++) {
        const country = body[i];
        country.code = "+" + country.code
    }
    console.log(body);
    contryCode.insertMany(body, (err, res) => {
      if (err) {
        callback(err, null);
      }
      callback(null, "Data saved  succesfully");
    });
  } catch (err) {
    callback(err, null);
  }
};

export const listOfCountryaCodes = (req, callback) => {
  try {
    contryCode.find({}, (err, res) => {
      if (err) {
        callback(err, null);
      }
      callback(null, res);
    });
  } catch (err) {
    callback(err, null);
  }
};
