"use strict";

function LatexPlugin() {}

var katex = require("./katex.min");

LatexPlugin.prototype.onParse = function (node, parser) {
  if (!parser.options.editable && node.type === "text" && node.text.includes("$")) {
    var parts = node.text.split(/(\${1,2})/);
    var nodes = [];
    var mode = 0; // 0: normal, 1: inline, 2: display

    for (var i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        if (!parts[i]) continue;
        if (mode === 0) {
          nodes.push({ type: "text", text: parts[i] });
        } else if (mode === 1) {
          var inlineTree = katex.default(parts[i], { strict: "ignore" });
          nodes.push({
            name: "span",
            attrs: {},
            l: "T",
            f: "display:inline-block",
            children: inlineTree
          });
        } else {
          var displayTree = katex.default(parts[i], {
            displayMode: !0,
            strict: "ignore"
          });
          nodes.push({
            name: "div",
            attrs: { style: "text-align:center" },
            children: displayTree
          });
        }
      } else if ("$" === parts[i] && "$" === parts[i + 2]) {
        mode = 1;
        parts[i + 2] = "";
      } else if ("$$" === parts[i] && "$$" === parts[i + 2]) {
        mode = 2;
        parts[i + 2] = "";
      } else {
        if (parts[i] && "$$" !== parts[i]) {
          parts[i + 1] = parts[i] + parts[i + 1];
        }
        mode = 0;
      }
    }

    delete node.type;
    delete node.text;
    node.name = "span";
    node.attrs = {};
    node.children = nodes;
  }
};

module.exports = LatexPlugin;
