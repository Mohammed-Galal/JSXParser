import { openingTagExp, emptyStr } from "./commonAssets.mjs";
import parse from "./xmlParser.mjs";

const cut = String.prototype.slice === undefined ? "substring" : "slice",
  closingTagExp = /^<\/\w|\/>$/,
  rootsExp = /\<\w/,
  fragExp = /\<\/?\>/g,
  fileSplitter = /(?=\<\/?\w)|(?<=\>)/g;

export default start;
function start(content) {
  const fragFilled = content.replace(fragExp, replacer),
    hasRoots = rootsExp.test(fragFilled);
  return hasRoots ? parseContent(fragFilled.split(fileSplitter)) : content;
}

function parseContent(contentArr) {
  const raw = [];
  let rootHolder = [],
    openRoots = 0,
    key = 0;
  contentArr.forEach(handleItem);
  return raw.join(emptyStr);

  function handleItem(item) {
    if (openingTagExp.test(item)) openRoots++;
    if (openRoots > 0) {
      rootHolder.push(item);
      if (closingTagExp.test(item) && --openRoots === 0) {
        const component = parse(rootHolder.join(emptyStr)),
          result =
            "{\n\t" +
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
            "\n}";

        rootHolder.length = 0;
        raw.push(result);
      }
    } else raw.push(item);
  }
}

function replacer(m) {
  return m[cut](0, -1) + "fragment>";
}
