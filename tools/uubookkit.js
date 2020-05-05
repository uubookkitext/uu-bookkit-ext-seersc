
export function uuBookKit() {

  let getDictionaryEntryData = async function(code) {
    let response = await UuApp.AppClient.Client.get(getUri() + "getDictionaryEntryData", {code: code}, {headers: {Authorization: getAuthorization()}});
    let dictionaryEntryData = String.fromCharCode.apply(null, response.data);
    //createDictionaryEntry("xxx", dictionaryEntryData);
    return dictionaryEntryData;
  }


}