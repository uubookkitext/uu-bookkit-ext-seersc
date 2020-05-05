
let uuBookKit = function() {

  let getDictionaryEntryData = async function(code) {
    let response = await UuApp.AppClient.Client.get(getUri() + "getDictionaryEntryData", {code: code}, {headers: {Authorization: getAuthorization()}});
    let dictionaryEntryData = String.fromCharCode.apply(null, response.data);
    //createDictionaryEntry("xxx", dictionaryEntryData);
    return dictionaryEntryData;
  }

  let createDictionaryEntry = async function (name, content) {
    let dtoIn = {
      code: generateUUID(32),
      name: name,
      type: "uu5string",
      isPublic: true,
      data: btoa(content)
    };
    let opts = {
      headers: {
        "Content-Transfer-Encoding": "base64",
        Authorization: getAuthorization()
      }
    };
    await UuApp.AppClient.Client.post(getUri() + "createDictionaryEntry", dtoIn, opts);
    return dtoIn.code;
  }

  let getDictionaryEntryLink = function(code) {
    return "<UuBookKit.References.DictionaryEntry code=\"" + code + "\"/>";
  }

  let getAuthorization = function() {
    let oidcSessionKey = Object.keys(window.sessionStorage).find(key=>key.startsWith("uu_app_oidc_providers_oidcg02_session"));
    let sessionStorage = window.sessionStorage.getItem(oidcSessionKey);
    let authorization = "Bearer " + JSON.parse(sessionStorage).idToken;
    return authorization;
  }

  let getUri = function() {
    return UU5.Environment.ccr.byKey["UuBookKit.BookReady"].props.calls.APP_BASE_URI;
  }

  let getPageCode = function() {
    return UU5.Environment.ccr.byKey["UuBookKit.Page"].props.page;
  }

  const REGEXP_XY = /[xy]/g;
  let generateUUID = function(length = 32) {
    length = Math.max(length, 8);
    let uuidCore = 'x4xxxyxx';
    const additionalCharLength = length - uuidCore.length;
    for (let i = 0; i < additionalCharLength; ++i) {
      if (i % 2 === 0) uuidCore = uuidCore + 'x';
      else uuidCore = 'x' + uuidCore;
    }

    let timeNum = new Date().getTime();
    return uuidCore.replace(REGEXP_XY, char => {
      let r = (timeNum + Math.random() * 16) % 16 | 0;
      timeNum = Math.floor(timeNum / 16);
      return (char === "x" ? r : r & 0x3 | 0x8).toString(16);
    });
  }

}