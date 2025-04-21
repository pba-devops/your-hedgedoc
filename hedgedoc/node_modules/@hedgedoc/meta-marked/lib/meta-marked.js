/* © 2013-2014 j201
* https://github.com/j201/meta-marked */

const { marked } = require("marked");
const yaml = require("js-yaml");

// Splits the given string into a meta section and a markdown section if a meta section is present, else returns null
function splitInput(str) {
  if (str.slice(0, 3) !== "---") return;

  const matcher = /\n(\.{3}|-{3})/g;
  const metaEnd = matcher.exec(str);

  return metaEnd && [str.slice(0, metaEnd.index), str.slice(matcher.lastIndex)];
}

const metaMarked = function(src, opt, callback) {
  if (Object.prototype.toString.call(src) !== "[object String]")
    throw new TypeError("First parameter must be a string.");

  const mySplitInput = splitInput(src);

  return mySplitInput
    ? {
        meta: yaml.load(mySplitInput[0]),
        html: marked(mySplitInput[1], opt, callback),
        markdown: mySplitInput[1]
      }
    : {
        meta: null,
        html: marked(src, opt, callback),
        markdown: src
      };
};

metaMarked.__proto__ = marked; // Yeah, it's non-standard, but it's better than copying everything over

metaMarked.noMeta = marked;

module.exports = metaMarked;
