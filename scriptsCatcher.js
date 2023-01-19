import { cut, emptyStr } from "./commonAssets.js";

export default (function () {
  const openScriptTag = "{",
    closingScriptTag = "}",
    openScriptTagExp = /\{/;

  let scripts = [],
    scriptHolder = [],
    pureContent = [];

  let str = null,
    endPos = null;

  let currentPos = 0,
    openScripts = 0;

  return function ($str) {
    if (openScriptTagExp.test($str)) {
      str = $str;
      endPos = $str.length;
      catchScript();
      const _Scripts = scripts,
        rawContent = pureContent;
      reset();

      return {
        scripts: _Scripts,
        input: rawContent.join(emptyStr),
      };
    } else return { scripts, input: $str };
  };

  function catchScript() {
    if (openScripts === 0) {
      const startPos = currentPos;
      currentPos = str.indexOf(openScriptTag, startPos);
      const isExisted = currentPos > -1;
      pureContent.push(str[cut](startPos, isExisted ? ++currentPos : endPos));
      if (isExisted === false) return;
      openScripts = 1;
    }

    const item = str[currentPos++];

    if (item === closingScriptTag && --openScripts === 0) {
      const result = scriptHolder.join(emptyStr);
      const resIndex = scripts.indexOf(result);
      scriptHolder.length = 0;
      pureContent.push(
        resIndex > -1 ? resIndex : scripts.push(result) - 1,
        item
      );
      catchScript();
    } else {
      if (item === openScriptTag) openScripts++;
      scriptHolder.push(item);
      catchScript();
    }
  }

  function reset() {
    if (openScripts > 0) throw "unhandled Script";
    currentPos = 0;
    scripts = [];
    scriptHolder = [];
    pureContent = [];
    str = endPos = null;
  }
})();
