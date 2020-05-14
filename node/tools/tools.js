const fs = require('fs');

function readStream(stream) {
  return new Promise((resolve, reject) => {
    let body = [];
    stream.on("data", chunk => {
      body.push(chunk);
    }).on("end", () => {
      body = Buffer.concat(body).toString();
      resolve(body);
    }).on("error", err => {
      reject(err);
    });
  });
}

function readConfig(configFile) {
  let data = fs.readFileSync(configFile);
  return JSON.parse(data);
}

function encode(data) {
  return Buffer.from(data).toString("base64");
}

function now() {
  let now = new Date();
  return ("0" + now.getDate()).slice(-2) + "." +
    ("0" + (now.getMonth() + 1)).slice(-2) + "." +
    now.getFullYear() + " " +
    ("0" + now.getHours()).slice(-2) + ":" +
    ("0" + now.getMinutes()).slice(-2);
}


module.exports = {
  readStream, encode, readConfig, now
}