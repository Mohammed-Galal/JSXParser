import { closingTagExp, openingTagExp, emptyStr } from "./commonAssets.js";
import parse from "./xmlParser.js";

export default (function () {
  const cut = String.prototype.slice === undefined ? "substring" : "slice",
    isNum = Number.isInteger,
    fragExp = /\<\/?\>/g,
    rootCheckExp = /\<\w/g,
    fileSplitter = /(?=\<\w)|(?<=\/\S*\>)/g;

  let raw = [],
    roots = [],
    rootHolder = [];

  let content = null,
    endPos = null;

  let openRoots = 0,
    index = 0;

  return start;

  function start(fileContent) {
    const fragFilled = fileContent.replace(fragExp, replacer);
    if (rootCheckExp.test(fragFilled)) {
      content = fragFilled.split(fileSplitter).filter(Boolean);
      endPos = content.length;
      collectRoots();
      const result = raw.map(filter).join(emptyStr);
      reset();
      return result;
    }
    return fileContent;
  }

  function collectRoots() {
    const item = content[index++];

    if (openingTagExp.test(item)) openRoots++;
    if (openRoots > 0) {
      rootHolder.push(item);
      if (closingTagExp.test(item) && --openRoots === 0) {
        const result = rootHolder.join(emptyStr);
        raw.push(roots.push(result) - 1);
        rootHolder.length = 0;
      }
    } else raw.push(item);

    if (endPos > index) collectRoots();
  }

  function reset() {
    if (openRoots > 0) throw "unhandled Root Element";
    content.length = index = raw.length = roots.length = rootHolder.length = 0;
    endPos = content = null;
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
