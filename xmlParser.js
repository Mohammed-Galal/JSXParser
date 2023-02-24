const catchScripts = require("./scriptsCatcher.js"),
  { openingTagExp, emptyStr, isArray } = require("./commonAssets.js");

const emptyArr = [],
  domArrSplitExp = /(?=\<|\/\>)|\>\s*/g,
  closingTagExp = /^\<?\/\w?/,
  catchFirstSpaceExp = /(?<=^\S+)\s+/,
  isComponentExp = /^[A-Z]|\./,
  trimCharsExp = /^\<|\s*$/g,
  attrsParseExp = /\S+=(?<tag>["'])[^]*?(?<!\\)\k<tag>/g;

let siblings = null,
  domArr = null,
  components = null,
  endPos = null,
  index = 0;

module.exports = function (str) {
  const obj = catchScripts(str);
  domArr = obj.input.split(domArrSplitExp);
  endPos = domArr.length;
  components = [];
  obj.dom = parseXML();
  obj.components = components;
  reset();
  delete obj.input;
  return obj;
};

function parseXML() {
  let item = domArr[index++];
  if (closingTagExp.test(item)) return;
  else if (openingTagExp.test(item)) {
    item = item.replace(trimCharsExp, emptyStr).split(catchFirstSpaceExp);
    item[0] = checkTag(item[0]);
    item[1] = item[1] ? item[1].match(attrsParseExp) : emptyArr;

    const prevSiblings = siblings;
    if (domArr[index] !== "/") siblings = item[2] = [];
    parseXML();
    siblings = prevSiblings;

    if (siblings === null) return item;
    siblings.push(item);
  } else item.split(/(?=\{)|(?<=\})/g).forEach(parseStr);
  parseXML();
}

function checkTag(tagName) {
  if (isComponentExp.test(tagName)) {
    const isExisted = components.indexOf(tagName);
    return isExisted > -1 ? isExisted : components.push(tagName) - 1;
  }
  return tagName;
}

function reset() {
  components = domArr = endPos = null;
  index = 0;
}

function parseStr(str) {
  if (str !== emptyStr)
    siblings.push(str[0] === "{" ? Number(str.slice(1, -1)) : str);
}
