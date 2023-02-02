import { openingTagExp, emptyStr } from "./commonAssets.mjs";
import parse from "./xmlParser.mjs";

const cut = String.prototype.slice === undefined ? "substring" : "slice",
  isNum = Number.isInteger,
  closingTagExp = /^<\/\w|\/>$/,
  fragExp = /\<\/?\>/g,
  rootCheckExp = /\<\w/g,
  fileSplitter = /(?=\<\/?\w)|(?<=\>)/g;

export default (function () {
  let raw = [],
    roots = [],
    rootHolder = [],
    openRoots = 0;

  return start;

  function start(fileContent) {
    const fragFilled = fileContent.replace(fragExp, replacer);
    if (rootCheckExp.test(fragFilled)) {
      fragFilled.split(fileSplitter).forEach(collectRoots);
      const result = raw.map(filter).join(emptyStr);
      reset();
      return result;
    }
    return fileContent;
  }

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

  function reset() {
    if (openRoots > 0) throw "unhandled Root Element";
    raw.length = roots.length = rootHolder.length = 0;
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

  function replacer(m) {
    return m[cut](0, -1) + "fragment>";
  }
})();
