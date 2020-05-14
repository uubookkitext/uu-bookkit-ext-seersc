const UU5StringTools = require("./tools.js");

const UU5StringObject = require("./uu5-string-object.js");
const UU5StringProps = require("./uu5-string-props.js");

const UU5String = class UU5String {
  constructor(uu5string, data = {}, initFn = null) {
    this.data = data;
    this.initFn = initFn;

    /*
      Transform content of UU5String into React components. If parameter data is undefined, data passed into constructor will be used instead.

      @param data - map with data for UU5String templates
      @param filterFn({tag, props}) - function to change tag and props used for rendering into components. Function is called for each descendant UU5StringObject before creation of React component. This function cannot change data of UU5StringObjects.
      @returns array of React components
      */
    this.toChildren = (data = this.data, filterFn) => {
      return UU5StringTools.contentToChildren(this.content, data, filterFn);
    };

    /*
      Transform content into string. If parameter data is undefined, data passed into constructor will be used instead.

      @param data - map with data for UU5String templates
      @param filterFn({tag, props}) - function to change tag and props used for printing into string. Function is called for each descendant UU5StringObject before print into string. This function cannot change data of UU5StringObjects.
      @returns string
    */
    this.toString = (data = this.data, filterFn) => {
      return UU5StringTools.contentToString(this.content, data, filterFn);
    };

    /*
      Returns new instance of UU5String. If parameter data is undefined, data passed into constructor will be used instead.

      @param data - data for UU5StringTemplates
      @returns UU5String instance.
    */
    this.clone = (data = this.data, initFn = this.initFn) => {
      let result = new UU5String(null, data);
      if (!this.content) return result;
      result.content = this.content.map((item) => typeof item === "string" ? item : item.clone(initFn));
      return result;
    };

    // constructor logic
    this.content = UU5String.parse(uu5string, (...args) => UU5StringObject.create(...args, initFn));
  }

  /* static functions */
  static parse(uu5string, buildItem = UU5StringObject.create) {
    return UU5StringTools.parseUu5String(uu5string, buildItem);
  }

  static isValid(uu5string) {
    return UU5StringTools.isValidUU5String(uu5string);
  }

  static toChildren(uu5string, data, filterFn) {
    return new UU5String(uu5string).toChildren(data, filterFn);
  }

  static toString(uu5string, data, filterFn) {
    return new UU5String(uu5string).toString(data, filterFn);
  }
  
  static contentToChildren(content, data, filterFn){
    return UU5StringTools.contentToChildren(content, data, filterFn);
  }

  static contentToString(content, data, filterFn){
    return UU5StringTools.contentToString(content, data, filterFn);
  }
};

UU5String.Props = UU5StringProps;
UU5String.Object = UU5StringObject;

module.exports = UU5String;
