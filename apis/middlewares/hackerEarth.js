'use strict';
const querystring = require('querystring');
const { curly } = require('node-libcurl');
// const CONFIG = require('../../apis/settings/constants');
const CONFIG = require('../common/constants');
let payload = [{
  'client_id': CONFIG.client_id,
  'client_secret': CONFIG.client_secret
}];

const commonHackerEarthPost = async (url, comingObject) => {

  try {
    Object.assign(payload[0], comingObject); //To assign upcoming data into payload body...
    // console.log(payload[0], " ", url);
    const { data } = await curly.post(url, {
      SSL_VERIFYPEER : 0,
      postFields: JSON.stringify(payload[0]),
      httpHeader: [
        'Content-Type: application/json',
        'Accept: application/json'
      ],
    });
    return data;

  }
  catch (error) {
    return res.status(400).send({ message: "Something went wrong in hackerEarth middleware..!", status: false, error: error.message });
  }
}


module.exports = {
  commonHackerEarthPost,
};