const REGEXP = require("../uu5mock/tools.js").REGEXP;

const UU5STRING_REGEXP = REGEXP.uu5string;
const UU5JSON_REGEXP = REGEXP.uu5json;
const UU5DATA_REGEXP = REGEXP.uu5data;
const JSCODE_REGEXP = REGEXP.jsCode;

const COMPONENT_NAME = String.raw`[-\w.]+`;
const ATTR = String.raw`(\s+)([-\w]+)(?:(\s*=\s*)("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|([^"'>\s/][^>\s/]*)))?`; // groups: attr separator, attr name, value separator, attr value, indication whether without quotes
const TAG = String.raw`<(${COMPONENT_NAME})((?:${ATTR})*)\s*(/)?>|</(${COMPONENT_NAME})>`; // groups: comp name, attrs, -, -, -, self-closing, closing tag
const ATTR_REGEXP = new RegExp(ATTR); // groups: see ATTR
const ATTR_VALUE_TYPE_REGEXP = new RegExp(String.raw`(${REGEXP.uu5json.source})|(${REGEXP.uu5string.source})|(${REGEXP.uu5data.source})|`); // groups: uu5json, uu5string, uu5data

const TEMPLATE_REG_EXP = new RegExp(REGEXP.uu5stringTemplate.source, "g");
const CHECK_IS_TEMPLATE = new RegExp(`^${REGEXP.uu5stringTemplate.source}$`);

module.exports = {
  UU5STRING_REGEXP, UU5JSON_REGEXP, UU5DATA_REGEXP, JSCODE_REGEXP, COMPONENT_NAME, ATTR, TAG, ATTR_REGEXP, ATTR_VALUE_TYPE_REGEXP, TEMPLATE_REG_EXP, CHECK_IS_TEMPLATE
};