"use strict";

// require('dotenv').config({ path: __dirname + '/.env' || './env.staging' });
// require("custom-env").env(process.env.NODE_ENV);
require('dotenv').config(process.env.NODE_ENV);
module.exports = {
  MONGO_URI: process.env.MONGO_URI, //for mongodb
  PROJECT_DIR: __dirname,
  TOKEN_SECRET: process.env.TOKEN_SECRET, //for token secret
  TESTIMONIAL_TOKEN_SECRET:process.env.TESTIMONIAL_TOKEN_SECRET,
  LOCAL_URL: process.env.LOCAL_URL, // for local url
  PORT: process.env.PORT, // for port number
  NODE_ENV: process.env.NODE_ENV, // for node env
  LOGGER: true,
  EMAIL_ID: process.env.EMAIL_ID,
  EMAIL_PWD: process.env.EMAIL_PWD,
  DEV_URL: process.env.DEV_URL,
  BASE_URL: process.env.BASE_URL,
  TEST_SERVER_URL: process.env.TEST_SERVER_URL,
};
