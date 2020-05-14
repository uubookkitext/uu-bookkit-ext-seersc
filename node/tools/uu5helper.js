const UU5String = require("../uu5string/uu5-string");

module.exports = {
  getTag: function(uu5, tag) {
    return uu5 && uu5.find(child => {
      if (typeof child === "object") {
        if (child.tag == tag) {
          return true;
        }
      }
      return false;
    });
  },

  getProp: function (uu5, propName) {
    return uu5 && uu5.props.props.find(prop => {
      if (typeof prop === "object") {
        if (prop.name == propName) {
          return true;
        }
      }
      return false;
    });
  },

  getXmlAttribute: function (name, text) {
    let regexp = new RegExp("(?<=\\b" + name + "=\")[^\"]*");
    let res = text.match(regexp);
    if (res && res.length > 0) {
      return res[0];
    }
  },

  parseUU5: function(body) {
    if(Array.isArray(body)) {
      body.forEach(item => item.content = UU5String.parse(item.content))
    } else {
      body.content = UU5String.parse(body.content)
    }
  },

  toUU5: function(body) {
    if(Array.isArray(body)) {
      body.forEach(item => item.content = `<uu5string/>${item.content.map(content => content.toString()).join("")}`)
    } else {
      body.content = `<uu5string/>${(body.content || [body.content]).map(content => content.toString()).join("")}`
    }
  }

}