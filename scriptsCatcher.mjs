import { emptyStr } from "./commonAssets.mjs";

const splitterExp = /(?<=\{)|(?=\})/g,
  openScriptTagExp = /\{$/,
  closingScriptTag = /^\}/,
  hasScripts = /\{/;

export default (function () {
  let scripts = [],
    scriptHolder = [],
    pureContent = [],
    openScripts = 0;

  return function (str) {
    const matched = str.match(splitterExp);
    if (matched && matched.length % 2 !== 0) throw "unhandled Script";
    else if (hasScripts.test(str)) {
      str.split(splitterExp).forEach(catchScript);
      const _Scripts = scripts,
        rawContent = pureContent;
      reset();
      return {
        scripts: _Scripts,
        input: rawContent.join(emptyStr),
      };
    } else return { scripts, input: str };
  };

  function catchScript(item) {
    if (openScripts === 0) pureContent.push(item);
    else if (closingScriptTag.test(item) && --openScripts === 0) {
      const result = scriptHolder.join(emptyStr);
      const resIndex = scripts.indexOf(result);
      scriptHolder.length = 0;
      pureContent.push(
        resIndex > -1 ? resIndex : scripts.push(result) - 1,
        item
      );
    } else scriptHolder.push(item);

    if (openScriptTagExp.test(item)) openScripts++;
  }

  function reset() {
    scripts = [];
    scriptHolder = [];
    pureContent = [];
  }
})();
