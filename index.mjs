import { openingTagExp, emptyStr } from "./commonAssets.mjs";
import parse from "./xmlParser.mjs";

const cut = String.prototype.slice === undefined ? "substring" : "slice",
  isNum = Number.isInteger,
  closingTagExp = /^<\/\w|\/>$/,
  fragExp = /\<\/?\>/g,
  rootCheckExp = /\<\w/,
  fileSplitter = /(?=\<\/?\w)|(?<=\>)/g;

let rootHolder = [],
  openRoots = 0;

export default start;
function start(content) {
  const fragFilled = content.replace(fragExp, replacer),
    balanced = rootCheckExp.test(fragFilled);
  return balanced ? parseContent(content.split(fileSplitter)) : content;
}

function parseContent(contentArr) {
  const roots = [],
    raw = [];

  contentArr.forEach(collectRoots);
  return raw.map(filter).join(emptyStr);

  function collectRoots(item) {
    if (openingTagExp.test(item)) openRoots++;
    if (openRoots > 0) {
      rootHolder.push(item);
      if (closingTagExp.test(item) && --openRoots === 0) {
        const result = rootHolder.join(emptyStr);
        raw.push(roots.push(result) - 1);
        rootHolder.length = 0;
      }
    } else raw.push(item);
  }

  function filter(c) {
    if (isNum(c)) {
      const component = parse(roots[c]);
      return (
        "{\n\t" +
        "key:" +
        c +
        ",\n\t" +
        "scripts:[" +
        component.scripts.map(start) +
        "],\n\t" +
        "components:[" +
        component.components +
        "],\n\t" +
        "dom:" +
        JSON.stringify(component.dom) +
        "\n}"
      );
    }
    return c;
  }
}

function replacer(m) {
  return m[cut](0, -1) + "fragment>";
}
