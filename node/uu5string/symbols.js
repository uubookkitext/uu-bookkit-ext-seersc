const Tools = require("../uu5mock/tools.js");


const SYMBOLS = {
  idHex32: () => Tools.generateUUID(32),
  idHex64: () => Tools.generateUUID(64)
};

module.exports = SYMBOLS;
