/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-unused-vars */

// This is the output of nearleyc for grammar.nearley
const rules: nearley.CompiledRules = {
  Lexer: undefined,
  ParserRules: [
    {
      name: "Main$subexpression$1$subexpression$1",
      symbols: ["statement", "_"],
    },
    {
      name: "Main$subexpression$1",
      symbols: ["Main$subexpression$1$subexpression$1"],
    },
    {
      name: "Main$subexpression$1$subexpression$2",
      symbols: ["statement", "_", { literal: ";", pos: 18 }],
    },
    {
      name: "Main$subexpression$1",
      symbols: ["Main$subexpression$1$subexpression$2"],
    },
    {
      name: "Main",
      symbols: ["Main$subexpression$1"],
      postprocess: function (data) {
        return data[0][0][0];
      },
    },
    { name: "statement$subexpression$1", symbols: ["literal"] },
    { name: "statement$subexpression$1", symbols: ["identifier"] },
    { name: "statement$subexpression$1", symbols: ["assignment"] },
    { name: "statement$subexpression$1", symbols: ["functionCall"] },
    { name: "statement$subexpression$1", symbols: ["declaration"] },
    { name: "statement$subexpression$1", symbols: ["cast"] },
    { name: "statement$subexpression$1", symbols: ["array_index"] },
    { name: "statement$subexpression$1", symbols: ["operator"] },
    { name: "statement$subexpression$1", symbols: ["parenthesis"] },
    { name: "statement$subexpression$1", symbols: ["_"] },
    {
      name: "statement",
      symbols: ["statement$subexpression$1"],
      postprocess: function (data) {
        return data[0][0];
      },
    },
    { name: "intDecimal$ebnf$1", symbols: [/[0-9]/] },
    {
      name: "intDecimal$ebnf$1",
      symbols: [/[0-9]/, "intDecimal$ebnf$1"],
      postprocess: function arrconcat(d) {
        return [d[0]].concat(d[1]);
      },
    },
    {
      name: "intDecimal",
      symbols: ["intDecimal$ebnf$1"],
      postprocess: function (data) {
        return {
          nodeType: "int",
          int: data[0].join().replace(/,/g, ""),
        };
      },
    },
    {
      name: "intHex$string$1",
      symbols: [{ literal: "0" }, { literal: "x" }],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    { name: "intHex$ebnf$1", symbols: [/[0-9a-fA-F]/] },
    {
      name: "intHex$ebnf$1",
      symbols: [/[0-9a-fA-F]/, "intHex$ebnf$1"],
      postprocess: function arrconcat(d) {
        return [d[0]].concat(d[1]);
      },
    },
    {
      name: "intHex",
      symbols: ["intHex$string$1", "intHex$ebnf$1"],
      postprocess: function (data) {
        return {
          nodeType: "int",
          int: parseInt(data[1].join().replace(/,/g, ""), 16).toString(),
        };
      },
    },
    { name: "int$subexpression$1", symbols: ["intDecimal"] },
    { name: "int$subexpression$1", symbols: ["intHex"] },
    {
      name: "int",
      symbols: ["int$subexpression$1"],
      postprocess: function (data) {
        return data[0][0];
      },
    },
    { name: "double$ebnf$1", symbols: [/[0-9]/] },
    {
      name: "double$ebnf$1",
      symbols: [/[0-9]/, "double$ebnf$1"],
      postprocess: function arrconcat(d) {
        return [d[0]].concat(d[1]);
      },
    },
    { name: "double$ebnf$2", symbols: [] },
    {
      name: "double$ebnf$2",
      symbols: [/[^']/, "double$ebnf$2"],
      postprocess: function arrconcat(d) {
        return [d[0]].concat(d[1]);
      },
    },
    {
      name: "double",
      symbols: ["double$ebnf$1", { literal: ".", pos: 111 }, "double$ebnf$2"],
      postprocess: function (data) {
        return {
          nodeType: "double",
          double:
            data[0].join().replace(/,/g, "") +
            "." +
            data[2].join().replace(/,/g, ""),
        };
      },
    },
    { name: "string$ebnf$1", symbols: [] },
    {
      name: "string$ebnf$1",
      symbols: [/[^"]/, "string$ebnf$1"],
      postprocess: function arrconcat(d) {
        return [d[0]].concat(d[1]);
      },
    },
    {
      name: "string",
      symbols: [
        { literal: '"', pos: 122 },
        "string$ebnf$1",
        { literal: '"', pos: 127 },
      ],
      postprocess: function (data) {
        return {
          nodeType: "string",
          string: data[1].join().replace(/,/g, ""),
        };
      },
    },
    {
      name: "char",
      symbols: [{ literal: "'", pos: 135 }, /[^']/, { literal: "'", pos: 139 }],
      postprocess: function (data) {
        return {
          nodeType: "char",
          char: data[1],
        };
      },
    },
    { name: "literal$subexpression$1", symbols: ["int"] },
    { name: "literal$subexpression$1", symbols: ["double"] },
    { name: "literal$subexpression$1", symbols: ["string"] },
    { name: "literal$subexpression$1", symbols: ["char"] },
    {
      name: "literal",
      symbols: ["literal$subexpression$1"],
      postprocess: function (data) {
        return {
          nodeType: "literal",
          literal: data[0][0],
        };
      },
    },
    { name: "identifier$ebnf$1", symbols: [] },
    {
      name: "identifier$ebnf$1",
      symbols: [/[a-zA-Z0-9_]/, "identifier$ebnf$1"],
      postprocess: function arrconcat(d) {
        return [d[0]].concat(d[1]);
      },
    },
    {
      name: "identifier",
      symbols: [/[a-zA-Z_]/, "identifier$ebnf$1"],
      postprocess: function (data) {
        return {
          nodeType: "identifier",
          identifier: (data[0] + data[1]).replace(/,/g, ""),
        };
      },
    },
    { name: "_$ebnf$1", symbols: [] },
    {
      name: "_$ebnf$1",
      symbols: [/[ ]/, "_$ebnf$1"],
      postprocess: function arrconcat(d) {
        return [d[0]].concat(d[1]);
      },
    },
    {
      name: "_",
      symbols: ["_$ebnf$1"],
      postprocess: function (_data) {
        return null;
      },
    },
    { name: "assignment$subexpression$1", symbols: ["declaration"] },
    { name: "assignment$subexpression$1", symbols: ["identifier"] },
    { name: "assignment$subexpression$1", symbols: ["array_index"] },
    {
      name: "assignment",
      symbols: [
        "assignment$subexpression$1",
        "_",
        { literal: "=", pos: 203 },
        "_",
        "statement",
      ],
      postprocess: function (data) {
        return {
          nodeType: "assignment",
          left: data[0][0],
          right: data[4],
        };
      },
    },
    {
      name: "functionCall",
      symbols: [
        "identifier",
        "_",
        { literal: "(", pos: 219 },
        "_",
        "statement",
        "_",
        { literal: ")", pos: 227 },
      ],
      postprocess: function (data) {
        return {
          nodeType: "functionCall",
          functionName: data[0],
          argument: data[4],
        };
      },
    },
    { name: "declaration$subexpression$1", symbols: ["single_declaration"] },
    { name: "declaration$subexpression$1", symbols: ["array_declaration"] },
    {
      name: "declaration",
      symbols: ["declaration$subexpression$1"],
      postprocess: function (data) {
        return {
          nodeType: "declaration",
          declaration: data[0][0],
        };
      },
    },
    {
      name: "single_declaration$subexpression$1",
      symbols: ["type", "_", "identifier"],
    },
    {
      name: "single_declaration",
      symbols: ["single_declaration$subexpression$1"],
      postprocess: function (data) {
        return {
          nodeType: "singleDeclaration",
          type: data[0][0],
          identifier: data[0][2],
        };
      },
    },
    {
      name: "array_declaration",
      symbols: [
        "type",
        "_",
        "identifier",
        "_",
        { literal: "[", pos: 271 },
        "_",
        "int",
        "_",
        { literal: "]", pos: 279 },
      ],
      postprocess: function (data) {
        return {
          nodeType: "arrayDeclaration",
          type: data[0],
          identifier: data[2],
          size: data[6],
        };
      },
    },
    {
      name: "array_index",
      symbols: [
        "identifier",
        "_",
        { literal: "[", pos: 291 },
        "_",
        "statement",
        "_",
        { literal: "]", pos: 299 },
      ],
      postprocess: function (data) {
        return {
          nodeType: "arrayIndex",
          identifier: data[0],
          value: data[4],
        };
      },
    },
    {
      name: "type$subexpression$1$string$1",
      symbols: [{ literal: "i" }, { literal: "n" }, { literal: "t" }],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    {
      name: "type$subexpression$1",
      symbols: ["type$subexpression$1$string$1"],
    },
    {
      name: "type$subexpression$1$string$2",
      symbols: [{ literal: "i" }, { literal: "n" }, { literal: "t" }],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    {
      name: "type$subexpression$1",
      symbols: [
        "type$subexpression$1$string$2",
        "_",
        { literal: "*", pos: 316 },
      ],
    },
    {
      name: "type$subexpression$1$string$3",
      symbols: [
        { literal: "d" },
        { literal: "o" },
        { literal: "u" },
        { literal: "b" },
        { literal: "l" },
        { literal: "e" },
      ],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    {
      name: "type$subexpression$1",
      symbols: ["type$subexpression$1$string$3"],
    },
    {
      name: "type$subexpression$1$string$4",
      symbols: [
        { literal: "d" },
        { literal: "o" },
        { literal: "u" },
        { literal: "b" },
        { literal: "l" },
        { literal: "e" },
      ],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    {
      name: "type$subexpression$1",
      symbols: [
        "type$subexpression$1$string$4",
        "_",
        { literal: "*", pos: 328 },
      ],
    },
    {
      name: "type$subexpression$1$string$5",
      symbols: [
        { literal: "s" },
        { literal: "t" },
        { literal: "r" },
        { literal: "i" },
        { literal: "n" },
        { literal: "g" },
      ],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    {
      name: "type$subexpression$1",
      symbols: ["type$subexpression$1$string$5"],
    },
    {
      name: "type$subexpression$1$string$6",
      symbols: [
        { literal: "c" },
        { literal: "h" },
        { literal: "a" },
        { literal: "r" },
      ],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    {
      name: "type$subexpression$1",
      symbols: ["type$subexpression$1$string$6"],
    },
    {
      name: "type$subexpression$1$string$7",
      symbols: [
        { literal: "c" },
        { literal: "h" },
        { literal: "a" },
        { literal: "r" },
      ],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    {
      name: "type$subexpression$1",
      symbols: [
        "type$subexpression$1$string$7",
        "_",
        { literal: "*", pos: 344 },
      ],
    },
    {
      name: "type$subexpression$1$string$8",
      symbols: [
        { literal: "v" },
        { literal: "o" },
        { literal: "i" },
        { literal: "d" },
      ],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    {
      name: "type$subexpression$1",
      symbols: ["type$subexpression$1$string$8"],
    },
    {
      name: "type$subexpression$1$string$9",
      symbols: [
        { literal: "v" },
        { literal: "o" },
        { literal: "i" },
        { literal: "d" },
      ],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    {
      name: "type$subexpression$1",
      symbols: [
        "type$subexpression$1$string$9",
        "_",
        { literal: "*", pos: 356 },
      ],
    },
    {
      name: "type",
      symbols: ["type$subexpression$1"],
      postprocess: function (data) {
        let type;
        if (data[0].length > 1) {
          type = data[0][0] + data[0][2];
        } else {
          type = data[0][0];
        }
        return {
          nodeType: "type",
          type: type,
        };
      },
    },
    {
      name: "cast",
      symbols: [
        { literal: "(", pos: 365 },
        "_",
        "type",
        "_",
        { literal: ")", pos: 373 },
        "_",
        "statement",
      ],
      postprocess: function (data) {
        return {
          nodeType: "cast",
          type: data[2],
          statement: data[6],
        };
      },
    },
    { name: "operator$subexpression$1", symbols: ["literal"] },
    { name: "operator$subexpression$1", symbols: ["identifier"] },
    { name: "operator$subexpression$1", symbols: ["functionCall"] },
    { name: "operator$subexpression$1", symbols: ["parenthesis"] },
    { name: "operator$subexpression$2", symbols: ["literal"] },
    { name: "operator$subexpression$2", symbols: ["identifier"] },
    { name: "operator$subexpression$2", symbols: ["functionCall"] },
    { name: "operator$subexpression$2", symbols: ["parenthesis"] },
    {
      name: "operator",
      symbols: [
        "operator$subexpression$1",
        "_",
        /[+\-*\/]/,
        "_",
        "operator$subexpression$2",
      ],
      postprocess: function (data) {
        return {
          nodeType: "operator",
          left: data[0][0],
          operator: data[2],
          right: data[4][0],
        };
      },
    },
    {
      name: "parenthesis",
      symbols: [
        { literal: "(", pos: 429 },
        "statement",
        { literal: ")", pos: 433 },
      ],
      postprocess: function (data) {
        return {
          nodeType: "parenthesis",
          statement: data[1],
        };
      },
    },
  ],
  ParserStart: "Main",
};

export default rules;
