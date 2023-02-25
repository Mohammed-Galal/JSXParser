const { openingTagExp, emptyStr } = require("./commonAssets.js");
const parse = require("./xmlParser.js");

const cut = String.prototype.slice === undefined ? "substring" : "slice",
  EXP = {
    comments: /\<\!--[^]+?--\>/g,
    fragmentTag: /\<\/?\>/g,
    closingTag: /^\<\/\w|\/\>$/,
    rootCheck: /\<\w\S*(?:\s*\/?\>|\s+\w\S*)/,
    fileSplit: /(?=\<\/\w|\<\w\S*(?:\s*\/?\>|\s+\w\S*))|(?<=\>)/g,
  };

module.exports = start;
function start(content) {
  const fragFilled = content.replace(EXP.fragmentTag, replacer),
    hasRoots = EXP.rootCheck.test(fragFilled);
  return hasRoots ? parseContent(fragFilled.split(EXP.fileSplit)) : content;
}

function parseContent(contentArr) {
  const raw = [],
    rootHolder = [];

  let openRoots = 0,
    key = 0;

  contentArr.forEach(handleItem);
  return raw.join(emptyStr);

  function handleItem(item) {
    if (openingTagExp.test(item)) openRoots++;
    else if (openRoots === 0) return raw.push(item);
    rootHolder.push(item);
    if (EXP.closingTag.test(item) && --openRoots === 0) {
      const rootStr = rootHolder.join(emptyStr),
        component = parse(rootStr.replace(EXP.comments, emptyStr)),
        result =
          "({\n\t" +
          "key:" +
          key++ +
          ",\n\t" +
          "scripts:[" +
          component.scripts.map(start) +
          "],\n\t" +
          "components:[" +
          component.components +
          "],\n\t" +
          "dom:" +
          JSON.stringify(component.dom) +
          "\n})";
      rootHolder.length = 0;
      raw.push(result);
    }
  }
}

function replacer(m) {
  return m[cut](0, -1) + "fragment>";
}
