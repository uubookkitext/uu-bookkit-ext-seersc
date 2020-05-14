const Tools = require("../uu5mock/tools.js");
const UU5StringTools = require("./tools.js");
const UU5Data = require("./uu5-data.js");

const DEFAULT_SEPARATOR = " ";
const DEFAULT_BOUNDARIES = "\"";
const DEFAULT_VALUE_DELIMITER = "=";

const UU5StringProps = class UU5StringProps {
  /* constructor */
  constructor(propsString, buildItem) {
    /* public methods */
    /*
      Returns props as an array of objects {name, value, separator}.

      @returns array
    */
    this.toArray = () => {
      return this.props;
    };

    /*
      Returns props as a map of name: value

      @returns object
    */
    this.toObject = () => {
      let result = {};
      this.props.forEach(item => result[item.name] = item.value);
      return result;
    };

    this.toChildren = (data, filterFn) => {
      let result = {};
      this.props.forEach((item) => result[item.name] = UU5StringProps._renderItemValueToChildren(item, data, filterFn));
      return result;
    };

    /*
      Returns props as a string with separators.

      @returns string
    */
    this.toString = (data, filterFn) => {
      let result = "";
      this.props.forEach(item => {
        result += `${item.separator || DEFAULT_SEPARATOR}${item.name}${UU5StringProps._renderItemValueToString(item, data, filterFn)}`
      });
      result += this.lastSeparator;
      return result;
    };

    this.clone = (initFn) => {
      let newPropsObject = new UU5StringProps();
      // set last separator
      newPropsObject.lastSeparator = this.lastSeparator;
      // set all props as a new array
      newPropsObject.props = this.props.map((item) => {
        let newItem = {};
        // clone all attributes
        for (let attr in item) {
          newItem[attr] = item[attr];
        }
        // clone object in value attribute - other attributes has only string values
        if (newItem.value && typeof newItem.value === "object") {
          // instead of: newItem.value instanceof UU5StringObject
          if (typeof newItem.value.clone === "function") {
            newItem.value = newItem.value.clone(initFn);
          } else {
            newItem.value = Tools.merge({}, newItem.value);
          }
        }
        return newItem;
      });
      return newPropsObject;
    };

    // constructor logic
    // parse props string into array of props - each prop have its name, value and separator - props are ordered by its order in string
    this.props = propsString ? UU5StringProps.parse(propsString, buildItem) : [];
    this.lastSeparator = propsString ? propsString.match(/\s*$/)[0] : "";
  }

  /* static methods */
  static parse(attrsString, buildItem) {
   return UU5StringTools.parseUU5StringProps(attrsString, buildItem);
  }

  /* private static methods */
  static _renderItemValueToString(item, data, filterFn) {
    if (!item.valueDelimiter && item.value === true) return "";
    let result;
    if (item.valueType === "uu5string") {
      result = "<uu5string/>" + UU5StringTools.contentToString(item.value, data, filterFn);
    } else if (item.valueType === "uu5json") {
      result = "<uu5json/>" + UU5StringTools.printTemplateToString(JSON.stringify(item.value, undefined, 2), data);
    } else if (item.valueType === "uu5data") {
      result = "<uu5data/>" + item.uu5DataKey;
    } else if (typeof item.value === "string") {
      result = UU5StringTools.printTemplateToString(item.value, data);
    } else {
      result = item.value;
    }
    // escape boundaries in prop value
    let boundaries = "";
    if (typeof result === "string") {
      if (item.valueBoundaries === undefined) {
        boundaries = DEFAULT_BOUNDARIES;
      } else if (item.valueBoundaries) {
        boundaries = item.valueBoundaries;
      }
      // escape content
      if (boundaries === "'") {
        result = result.replace(/([\\'])/g, "\\$1");
      } else if (boundaries === "\"") {
        result = result.replace(/([\\"])/g, "\\$1");
      }
    }
    return `${item.valueDelimiter || DEFAULT_VALUE_DELIMITER}${boundaries}${result}${boundaries}`;
  }

  static _renderItemValueToChildren(item, data, filterFn) {
    if (item.valueType === "uu5string") {
      return UU5StringTools.contentToChildren(item.value, data, filterFn);
    } else if (item.valueType === "uu5json") {
      return item.value ? JSON.parse(UU5StringTools.printTemplateToString(JSON.stringify(item.value), data)) : {};
    } else if (item.valueType === "uu5data") {
      item.value = UU5Data.parse("<uu5data/>" + item.uu5DataKey);
      return item.value;
    }

    return typeof item.value === "string" ? UU5StringTools.printTemplateToChildren(item.value, data) : item.value;
  }

};

module.exports = UU5StringProps;
