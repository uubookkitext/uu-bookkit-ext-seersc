const {AuthenticationService, AppClient} = require("uu_appg01_server-client");
const fs = require('fs');

async function auth(scope, tokenFile) {
  let token;
  try {
    token = readToken(tokenFile);
    try {
      await test(scope, token);
    } catch (err) {
      if (err && (err.response.status == 403 || err.response.status == 401 || err.response.status == 500)) {
        token = null;
      }
    }
  } catch (err) {
    token = null;
  }
  if (!token) {
    token = await authenticate(scope, tokenFile);
  }
  return getOptions(token);
}

async function authenticate(scope, tokenFile) {
  try {
    let session = await AuthenticationService.authenticate();
    let tokenScope = await session.getCallTokenScope(scope);
    let token = await session.getCallToken(tokenScope);
    writeToken(tokenFile, token);
    return token;
  } catch (err) {
    console.error(err);
  }
}

async function test(scope, token) {
  let response = await AppClient.get(scope, null, getOptions(token));
  console.log(response);
}

function getOptions(token) {
  return {
    session: {
      getCallToken: function () {
        return token;
      }
    }
  };
}

function readToken(tokenFile) {
  return fs.readFileSync(tokenFile, 'ascii');
}

function writeToken(tokenFile, token) {
  fs.writeFileSync(tokenFile, token, 'ascii');
}

module.exports = auth