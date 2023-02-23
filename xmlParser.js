const catchScripts = require("./scriptsCatcher.js");
const { openingTagExp, emptyStr } = require("./commonAssets.js");

const domArrSplitExp = /(?=\<|\/\>)|\>\s*/g,
  closingTagExp = /^\<?\/\w?/,
  catchFirstSpaceExp = /(?<=^\S+)\s+/g,
  isComponentExp = /^[A-Z]|\./,
  trimCharsExp = /^\<|\s*$/g,
  attrsParseExp = /\s+(?=\S+\=|\{\d+\})/g;

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
    const node = item.replace(trimCharsExp, emptyStr).split(catchFirstSpaceExp),
      tag = checkTag(node[0]),
      attrs = node[1] ? node[1].split(attrsParseExp) : [];

    item = [tag, attrs];

    if (domArr[index] !== "/") {
      const prevSiblings = siblings,
        children = (item[2] = []);
      siblings = children;
      parseXML();
      siblings = prevSiblings;
    }
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
