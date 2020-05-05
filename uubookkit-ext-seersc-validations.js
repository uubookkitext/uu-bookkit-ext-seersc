// ==UserScript==
// @name         uuBookKit-ext-seersc-validations
// @namespace    https://github.com/uubookkitext/uu-bookkit-ext-seersc
// @version      0.1.0
// @description  uuBookkit extension to create validation rule and validation messages for seersc purpose
// @author       Tomas Trtik, Petr Havelka
// @match        https://uuos9.plus4u.net/uu-dockitg01-main/*
// @match        https://uuos9.plus4u.net/uu-bookkitg01-main/*
// @match        https://uuapp.plus4u.net/uu-bookkit-maing01/*
// @match        https://docs.plus4u.net/book*
// @match        https://docs.plus4u.net/uaf/*
// @require      http://code.jquery.com/jquery-2.1.4.min.js
// @require      https://code.jquery.com/ui/1.12.1/jquery-ui.js
// @require      https://cdn.plus4u.net/uu-appg01-core/4.0.0/uu_appg01_core.js
// @require      https://raw.githubusercontent.com/uubookkitext/uu-bookkit-ext-seersc/master/tools/uubookkit.js
// ==/UserScript==

(function() {
  'use strict';

  console.log("uuBookKit-ext-seersc-validations starting...");

  let currentBook = {};
  let currentPageData = {};
  let currentBookStructure = {};

  let initPage = function() {
    let page = $(".uu-bookkit-page-ready");
    // if page not ready do it later
    if (!page.length) {
      setTimeout(initPage, 200);
      return;
    }

    let pageUu5DataMap = UU5.Environment.ccr.byKey["UuBookKit.Page"].state.dtoOut.uu5DataMap;

    if ((pageUu5DataMap.validation) && (pageUu5DataMap.validation.ruleTemplate) && (pageUu5DataMap.validation.messageTemplate)) {
      let ruleTemplateCode = pageUu5DataMap.validation.ruleTemplate;
      let messageTemplateCode = pageUu5DataMap.validation.messageTemplate;

      // find "add section" buttons and adds "add rule" and "add message" buttons
      let addSectionButtons = $(".uudcc-bricks-section-collection-ready-create-button-wrapper button");
      if (addSectionButtons) {
        addSectionButtons.each((index, addSectionButton) => {
          let buttonClass = $(addSectionButton).attr("class");
          let buttonSpanClass = $(addSectionButton).find("span").attr("class");

          let addRuleButton = createAddButton("Add Rule", buttonClass, buttonSpanClass);
          $(addSectionButton).after(addRuleButton);
          let addMsgButton = createAddButton("Add Message", buttonClass, buttonSpanClass);
          $(addRuleButton).after(addMsgButton);


          addRuleButton.click(function() {
            let addSectionButtonWrapper = $(this).parent(".uudcc-bricks-section-collection-ready-create-button-wrapper");
            let origSection = addSectionButtonWrapper.next(".uudcc-bricks-basic-section").first();

            // click to add new section
            $(addSectionButton).click();

            // add the rule to the new section
            addRule(ruleTemplateCode, addSectionButtonWrapper, origSection);
          });

          addMsgButton.click(function() {
            let addSectionButtonWrapper = $(this).parent(".uudcc-bricks-section-collection-ready-create-button-wrapper");

            // add the message to the end of the section
            createValidationMessage(messageTemplateCode, addSectionButtonWrapper);
          });
        });
      }
    }
  }

  let createValidationMessage = async function(messageTemplateCode, addSectionButtonWrapper) {
    let section = addSectionButtonWrapper.next(".uudcc-bricks-basic-section").first();
    let basicSection = findReactComponent(section[0]).props.parent;

    // read template
    let template = await uuBookKit.getDictionaryEntryData(messageTemplateCode);
    // create new entry from template
    let code = await createDictionaryEntry("ValMsg new", template);

    // get the existing content
    let content = basicSection.getComponentContentById();
    // insert dictionary link to the existing content
    let idx = content.indexOf("</UU5.Bricks.Section></UU5.Bricks.Section>");
    content = "<uu5string/>" + content.slice(0, idx) + getDictionaryEntryLink(code) + content.slice(idx);

    // update page section
    basicSection.setContent(content);
    basicSection.onDccDataChange(content, (data) => console.log(data), (data) => console.log("Error: " + data));
  }

  let addRule = async function(ruleTemplateCode, addSectionButtonWrapper, origSection) {
    let section = addSectionButtonWrapper.next(".uudcc-bricks-basic-section").first();
    // waiting for the new section
    if (!section[0] || (section[0].id == origSection[0].id)) {
      setTimeout(function() {addRule(ruleTemplateCode, addSectionButtonWrapper, origSection)}, 200);
      return;
    }
    let basicSection = findReactComponent(section[0]).props.parent;

    // read template
    let template = await uuBookKit.getDictionaryEntryData(ruleTemplateCode);

    // update page section with the template content
    basicSection.setContent(template);
    basicSection.onDccDataChange(template, (data) => console.log(data), (data) => console.log("Error: " + data));
  }

  let createAddButton = function(text, buttonClass, buttonSpanClass) {
    let addButtonText = '<button type="button"><span>' + text + '</span></button>';
    let addButton = $(addButtonText);
    addButton.attr("class", buttonClass);
    addButton.find("span").attr("class", buttonSpanClass);
    return addButton;
  }

  ////////////////////////////////////////////////
  // bookkit helpers

  /*
  let getDictionaryEntryData = async function(code) {
    let response = await UuApp.AppClient.Client.get(getUri() + "getDictionaryEntryData", {code: code}, {headers: {Authorization: getAuthorization()}});
    let dictionaryEntryData = String.fromCharCode.apply(null, response.data);
    //createDictionaryEntry("xxx", dictionaryEntryData);
    return dictionaryEntryData;
  }
   */

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

  ////////////////////////////////////////////////
  // generic helpers

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

  let findReactComponent = function(dom, traverseUp = 0) {
    const key = Object.keys(dom).find(key=>key.startsWith("__reactInternalInstance$"));
    const domFiber = dom[key];
    if (domFiber == null) return null;

    const GetCompFiber = fiber=>{
      //return fiber._debugOwner; // this also works, but is __DEV__ only
      let parentFiber = fiber.return;
      while (typeof parentFiber.type == "string") {
        parentFiber = parentFiber.return;
      }
      return parentFiber;
    };

    let compFiber = GetCompFiber(domFiber);
    for (let i = 0; i < traverseUp; i++) {
      compFiber = GetCompFiber(compFiber);
    }
    return compFiber.stateNode;
  }

  // inject to CMD call
  let injectToHttpRequest = function () {
    let origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, async, user, pass) {

      if (url.includes("loadBook")) {
        this.addEventListener('load', function () {
          currentBook = JSON.parse(this.responseText);
        });
      }
      if (url.includes("loadPage")) {
        this.addEventListener('load', function () {
          currentPageData = JSON.parse(this.responseText);
          initPage();
        });
      }
      if (url.includes("getBookStructure")) {
        this.addEventListener('load', function () {
          currentBookStructure = JSON.parse(this.responseText);
        });
      }
      /*
       if (url.includes("updatePageSection")) {
         this.addEventListener('load', function () {
           console.log(JSON.parse(this.responseText));
         });
       }
 */
      origOpen.apply(this, arguments);
    };
  };

  // do inject
  injectToHttpRequest();

})();