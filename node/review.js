const { AppClient } = require("uu_appg01_server-client");
const UU5String = require("./uu5string/uu5-string");
const auth = require("./tools/auth.js");
const {readConfig, now} = require("./tools/tools.js");
const {getTag, getProp, getXmlAttribute, parseUU5, toUU5} = require("./tools/uu5helper.js");

let ignoredSectionList = [
  "UuAppBusinessModelKit.BusinessUseCase.Bricks.BasicInfo",
  "UuTerritory.Activity.Bricks.ActivityList",
  "UuAppBusinessModelKit.BusinessUseCase.Bricks.ProcessList",
  "UuAppBusinessModelKit.BusinessUseCase.Bricks.ProductList",
  "UuAppBusinessModelKit.BusinessUseCase.Bricks.BusinessUseCaseLaunchList",
  "UuAppBusinessModelKit.BusinessUseCase.Bricks.BusinessUseCaseList",
  "UuTerritory.ArtifactIfc.Bricks.AarListBySideA"
];
let ignoredSectionRegExp = new RegExp(ignoredSectionList.join("|"));

async function review() {
  let config = readConfig("config.json");
  let options = await auth(config.reviewBook, config.tokenFile);
  //reviewPage(updateStat, config, options);
  reviewPage(reviewDone, config, options);
}

async function reviewPage(action, config, options) {
  let pageData = await AppClient.get(config.reviewBook + "loadPage", {code: config.reviewStatPage}, options);
  parseUU5(pageData.body);

  for (let i = 0; i < pageData.body.length; i++) {
    let uu5 = pageData.body[i].content;

    uu5 = getTag(uu5,"UU5.Bricks.Lsi");
    uu5 = getTag(uu5.children, "UU5.Bricks.Lsi.Item");
    let uu5Table = getTag(uu5.children, "UuContentKit.Tables.Table");
    if (uu5Table && uu5Table.tag == "UuContentKit.Tables.Table") {
      // the table with pages in the section
      let table = getProp(uu5Table, "data");

      for (let i = 0; i < table.value.length; i++) {
        let pageLink = table.value[i][0];
        if (pageLink) {
          // get the page code from the first column
          let reviewPage = getXmlAttribute("page", pageLink);
          if (reviewPage) {
            // process the action on the section
            await action(table, i, reviewPage, config, options);
          }
        }
      }

      // set table header
      table.value[0][0] = "Page";
      table.value[0][1] = "Review";
      table.value[0][2] = "Review Comments";
      table.value[0][3] = "Versions " + now();

      // set table columns width
      let colWidth = getProp(uu5Table, "colWidth");
      if (colWidth) {
        colWidth.value = ["200", "350", "250", "300"];
      }
    }
  }

  // convert page back to uu5string
  toUU5(pageData.body);

  // update the page
  let updatePage = {};
  updatePage.code = pageData.code;
  updatePage.sys = pageData.sys;
  updatePage.sectionList = pageData.body;
  await AppClient.post(config.reviewBook + "updatePage", updatePage, options);
}

// update statistics
async function updateStat(table, row, reviewPage, config, options) {
  // get comments, convert to stats and format to uu5string
  let commentList = await getPageComments(reviewPage, config.reviewBook, options);
  let commentStatList = getCommentStat(commentList);
  table.value[row][2] = formatCommentStats(commentStatList);

  // load page sections
  let reviewPageData = await AppClient.get(config.reviewBook + "loadPage", {code: reviewPage}, options);

  // get sections' versions
  let sectionListVer = getPageSectionsVersions(reviewPageData);
  table.value[row][3] = formatPageSectionsVersions(sectionListVer);

  // calculate changed sections from last review
  table.value[row][1] = reviewersChangeList(table.value[row][1], sectionListVer);
}

// get all comments for the page
async function getPageComments(page, book, options) {
  let commentList = await AppClient.get(book + "listCommentThreads", {page: page, active: true}, options);
  return commentList.data.itemList;
}

// build comments stat -> group comments by title and author
function getCommentStat(commentList) {
  let commentStatMap = {};
  commentList.forEach(comment => {
    let commentStat = commentStatMap[comment.name];
    if (!commentStat) {
      commentStat = {
        name: comment.name,
        authorMap: {},
        count: 0
      };
      commentStatMap[comment.name] = commentStat;
    }
    commentStat.count++;

    authorName = comment.commentList[0].authorName;
    let authorStat = commentStat.authorMap[authorName];
    if (!authorStat) {
      authorStat = {
        author: authorName,
        count: 0
      };
      commentStat.authorMap[authorName] = authorStat;
    }
    authorStat.count++;
  });
  // convert maps to lists
  return Object.keys(commentStatMap).map(commentStatKey => {
    let commentStat = commentStatMap[commentStatKey];
    return {
      name: commentStat.name == "" ? "unknown" : commentStat.name,
      authorList: Object.keys(commentStat.authorMap).map(authorKey => commentStat.authorMap[authorKey]),
      count: commentStat.count
    };
  })
}

// format comments stats into uu5string
function formatCommentStats(commentStatList) {
 let commentStatStr = "<uu5string/>";
 commentStatList.forEach(commentStat => {
   commentStatStr += commentStat.name + ": " + commentStat.count + "<UU5.Bricks.Ul>";
   commentStat.authorList.forEach(author => {
     commentStatStr += "<UU5.Bricks.Li>" + author.author + ": " + author.count + "</UU5.Bricks.Li>";
   });
   commentStatStr += "</UU5.Bricks.Ul>";
 });
 return commentStatStr;
}

// get versions of page sections
function getPageSectionsVersions(reviewPageData) {
  let sectionListVer = {};
  reviewPageData.body.forEach(section => {
    if (section.sys.rev > 0) {
      // derive section label - from section header, by known uu5 component
      let sectionLabel = getXmlAttribute("header", section.content);
      if (!sectionLabel) {
        if ((section.content.indexOf("UuApp.DesignKit.Scenario") >= 0) || (section.content.indexOf("UuApp.DesignKit.Algorithm") >= 0)) {
          sectionLabel = "Scenario";
        } else if (section.content.indexOf("UuBookKit.Review.CommentPoint") >= 0) {
          sectionLabel = "Comment Point";
        } else {
          // check ignored sections
          if (!ignoredSectionRegExp.test(section.content)) {
            // set the section id as section label, if not recognized nad not ignored
            sectionLabel = section.code;
          }
        }
      }
      if (sectionLabel) {
        sectionListVer[section.code] = {code: section.code, label: sectionLabel, rev: section.sys.rev};
      }
    }
  });
  return sectionListVer;
}

// format sections versions
function formatPageSectionsVersions(sectionListVer) {
  let versions = "<uu5string/>";
  Object.values(sectionListVer).forEach(section => {
    versions += "<UU5.Bricks.Div>" + section.label + " - " + section.rev + "</UU5.Bricks.Div>";
  });
  return versions;
}

// get changes from last review
function reviewersChangeList(reviewers, sectionListVer) {
  let uu5Reviewers = UU5String.parse(reviewers);
  let newReviewers = "";
  uu5Reviewers.forEach(reviewer => {
    // get reviewer
    if ((typeof reviewer === "object") && (reviewer.tag == "UU5.Bricks.P")) {
      // get sections versions from last review (stored in versions attribute)
      let revAttr = getProp(reviewer, "versions");
      if (revAttr) {
        newReviewers += reviewer.toString();
        let changeList = "";
        let sectionListRev = JSON.parse(revAttr.value);
        // compare versions from last review with current versions
        sectionListRev.forEach(sectionRev => {
          let sectionVer = sectionListVer[sectionRev.code];
          if (sectionVer) {
            if (sectionVer.rev > sectionRev.rev) {
              changeList += "<UU5.Bricks.Li>" + sectionVer.label + " - " + sectionRev.rev + " (" + sectionVer.rev + ")</UU5.Bricks.Li>";
            }
          }
        });
        if (changeList) {
          newReviewers += "<UU5.Bricks.Ul>" + changeList + "</UU5.Bricks.Ul>";
        }
      }
    }
  });
  if (newReviewers) {
    newReviewers = "<uu5string/>" + newReviewers;
  }
  return newReviewers;
}

async function reviewDone(table, row, reviewPage, config, options) {
  let review = config.reviewer + ": " + now();

  if (reviewPage == config.reviewPage) {
    // load sections versions
    let reviewPageData = await AppClient.get(config.reviewBook + "loadPage", {code: reviewPage}, options);
    let sectionList = reviewPageData.body.map(section => {return {code: section.code, rev: section.sys.rev};});
    let versions = JSON.stringify(sectionList);

    // check if reviewer is already present
    let uu5string = table.value[row][1];
    if (uu5string.indexOf(config.reviewer) >= 0) {
      // if reviewer is already present, update the versions
      let uu5 = UU5String.parse(uu5string);
      uu5.forEach((uu5Object) => {
        if (uu5Object.children[0].indexOf(config.reviewer) >= 0) {
          let versionsAttr = getProp(uu5Object, "versions");
          uu5Object.children[0] = review;
          versionsAttr.value = versions;
        }
      });
      uu5string = uu5.map(content => content.toString()).join("");
    } else {
      // if the review is not present yet, create new review and set the versions
      uu5string += "<UU5.Bricks.P versions='" +  versions + "'>" + review + "</UU5.Bricks.P>";
    }
    table.value[row][1] = "<uu5string/>" + uu5string;
  }
}

review();


