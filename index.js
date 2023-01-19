const { cut, openingTagExp, emptyStr } = require("./commonAssets.js"),
  parse = require("./xmlParser.js");

module.exports = (function () {
  const isNum = Number.isInteger,
    closingTagExp = /\/(\S+)?\>$/,
    fragExp = /\<\/?\>/g,
    rootCheckExp = /\<\w/g,
    fileSplitter = /(?=\<\w)|(?<=\/(\S+)?\>)/g;

  let raw = [],
    roots = [],
    rootHolder = [];

  let content = null,
    endPos = null;

  let openRoots = 0,
    index = 0;

  return start;

  function start(fileContent) {
    if (rootCheckExp.test(fileContent)) {
      content = fileContent.replace(fragExp, replacer).split(fileSplitter);
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

    if (index < endPos) collectRoots();
  }

  function reset() {
    if (openRoots > 0) throw "unhandled Root Element";
    index = raw.length = roots.length = rootHolder.length = 0;
    endPos = content = null;
  }

  function filter(c, key) {
    if (isNum(c)) {
      const component = parse(roots[c]);
      return (
        "{\n\t" +
        "key:" +
        key +
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
