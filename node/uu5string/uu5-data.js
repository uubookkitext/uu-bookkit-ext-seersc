//import Environment from "../../environment/environment";
const {UU5DATA_REGEXP} = require("./constants.js");

class UU5Data {

  static parse(uu5Data) {
    uu5Data = uu5Data.replace(UU5DATA_REGEXP, '');
    let data;// = Environment.uu5DataMap && Environment.uu5DataMap[uu5Data];
    if (typeof data === undefined) {
      console.warn(`There is no component data in Environment.uu5DataMap for uu5Data: ${uu5Data} !`, {
        uu5Data: uu5Data
      });
    }
    return data;
  }
}

module.exports = UU5Data;
