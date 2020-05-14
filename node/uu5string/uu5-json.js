const UU5_JSON_REGEXP = /^\s*<uu5json\s*\/>/;

class UU5Json {

  static parse(uu5Json) {
    uu5Json = UU5Json.toJson(uu5Json);
    let value = null;

    try {
      value = JSON.parse(uu5Json);
    } catch (err) {
      console.error("Error uu5JSON parse.", {
        uu5Json: uu5Json,
        cause: err
      });

      err.code = "uu5JsonInvalid";
      err.context = { json: uu5Json };

      throw err;
    }

    return value;
  }

  static toJson(uu5Json) {
    return uu5Json.replace(UU5_JSON_REGEXP, "");
  }

  constructor(json) {
    this._uu5json = json;
    this._object = UU5Json.parse(json);
  }

  toUU5Json() {
    return this._uu5json
  }

  toJson() {
    return this._uu5json
  }

  toObject() {
    return this._object;
  }

  clone() {
    return new UU5Json(this._uu5json);
  }
}

module.exports = UU5Json;
