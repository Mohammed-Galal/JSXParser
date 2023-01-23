import catchScripts from "./scriptsCatcher.js";
import { openingTagExp, emptyStr } from "./commonAssets.js";

export default (function () {
  const domArrSplitExp = /(?=\<|\/\>)|\>\s*/g,
    closingTagExp = /^\<?\/\w?/,
    catchFirstSpaceExp = /(?<=^\S+)\s+/g,
    isComponentExp = /^[A-Z]|\./g,
    trimCharsExp = /^\<|\s*$/g;

  let siblings = null,
    domArr = null,
    components = null,
    endPos = null,
    index = 0;

  return function (str) {
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
    const item = domArr[index++],
      isNotClosingTag = closingTagExp.test(item) === false;

    if (openingTagExp.test(item)) {
      const node = item
          .replace(trimCharsExp, emptyStr)
          .split(catchFirstSpaceExp),
        tag = (function () {
          const tagName = node[0];
          if (isComponentExp.test(tagName)) {
            const isExisted = components.indexOf(tagName);
            return isExisted > -1 ? isExisted : components.push(tagName) - 1;
          }
          return tagName;
        })(),
        attrs = node[1] || null,
        children = [];

      const N = [tag, attrs, children],
        prevSiblings = siblings;

      siblings = children;
      parseXML();
      siblings = prevSiblings;
      if (prevSiblings === null) return N;
    } 
    
    if (isNotClosingTag) {
      siblings.push(item);
      parseXML();
    }
  }

  function reset() {
    components = domArr = endPos = null;
    index = 0;
  }
})();
