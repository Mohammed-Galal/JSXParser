const { openingTagExp, emptyStr } = require("./commonAssets.js"),
  parse = require("./xmlParser.js");

const underScore = "_",
  repeat = (m) => underScore.repeat(m.length),
  cut = String.prototype.slice === undefined ? "substring" : "slice",
  EXP = {
    strings: /(?<tag>["'`])[^]*?(?<!\\)\k<tag>/g,
    comments: /\<\!--[^]+?--\>/g,
    fragmentTag: /\<\/?\>/g,
    closingTag: /^\<\/\w|\/\>$/,
    rootCheck: /\<\w\S*(?:\s*\/?\>|\s+\w\S*)/,
    fileSplit: /(?=\<\/\w|\<\w\S*(?:\s*\/?\>|\s+\w\S*))|(?<=\>)/g,
  };

module.exports = start;
function start(content) {
  const fragFilled = content.replace(EXP.fragmentTag, replacer),
    stringsRemoved = fragFilled.replace(EXP.strings, repeat),
    roots = new RegExp(gatherRoots(fragFilled), "g");

  return fragFilled.replace(roots, rootHandler);

  function rootHandler(rootStr, index) {
    if (stringsRemoved.indexOf(rootStr.replace(EXP.strings, repeat)) !== index)
      return rootStr;

    const component = parse(rootStr.replace(EXP.comments, emptyStr));
    return (
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
      "\n})"
    );
  }
}

let key = 0;
function gatherRoots(str) {
  const contentArr = str.split(EXP.fileSplit),
    roots = [],
    rootHolder = [];

  let openRoots = 0;

  contentArr.forEach(handleItem);
  return roots.join("|");

  function handleItem(item) {
    if (openingTagExp.test(item)) openRoots++;
    else if (openRoots === 0) return;
    rootHolder.push(item);
    if (EXP.closingTag.test(item) && --openRoots === 0) {
      const rootStr = rootHolder.join(emptyStr);
      rootHolder.length = 0;
      roots.push(rootStr);
    }
  }
}

function replacer(m) {
  return m[cut](0, -1) + "fragment>";
}
