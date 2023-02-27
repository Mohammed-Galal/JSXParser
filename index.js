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
    stringsRemoved = fragFilled.replace(EXP.strings, repeat);
  return gatherRoots(fragFilled, stringsRemoved);
}

function gatherRoots(str, stringsRemoved) {
  const contentArr = str.split(EXP.fileSplit),
    CONTENT = [],
    rootHolder = [];

  let openRoots = 0,
    currentPos = 0;

  contentArr.forEach(handleItem);
  return CONTENT.concat(str[cut](currentPos)).join(emptyStr);

  function handleItem(item) {
    if (openingTagExp.test(item)) openRoots++;
    else if (openRoots === 0) return;
    rootHolder.push(item);
    if (EXP.closingTag.test(item) && --openRoots === 0) {
      const rootStr = rootHolder.join(emptyStr),
        rootIndex = stringsRemoved.indexOf(
          rootStr.replace(EXP.strings, repeat),
          currentPos
        );

      rootHolder.length = 0;
      if (rootIndex === -1) return;

      const realIndex = str.indexOf(rootStr, currentPos);

      if (rootIndex === realIndex) {
        CONTENT.push(str[cut](currentPos, rootIndex));
        currentPos = rootIndex + rootStr.length;
        CONTENT.push(handleRoot(rootStr, rootIndex));
      } else {
        const lastpoint = realIndex + rootStr.length;
        CONTENT.push(str[cut](currentPos, lastpoint));
        currentPos = lastpoint;
      }
    }
  }
}

function replacer(m) {
  return m[cut](0, -1) + "fragment>";
}

function handleRoot(R, index) {
  const component = parse(R.replace(EXP.comments, emptyStr));
  return (
    "({\n\t" +
    "key:" +
    index +
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
