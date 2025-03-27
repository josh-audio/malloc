// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
/* eslint-disable no-useless-escape */
const grammar: nearley.CompiledRules = {
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
      symbols: ["statement", "_", { literal: ";" }],
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
    { name: "statement$subexpression$1", symbols: ["function_call"] },
    { name: "statement$subexpression$1", symbols: ["declaration"] },
    { name: "statement$subexpression$1", symbols: ["cast"] },
    { name: "statement$subexpression$1", symbols: ["array_index"] },
    { name: "statement$subexpression$1", symbols: ["operator"] },
    { name: "statement$subexpression$1", symbols: ["parenthesis"] },
    { name: "statement$subexpression$1", symbols: ["dereference"] },
    { name: "statement$subexpression$1", symbols: ["type"] },
    {
      name: "statement",
      symbols: ["statement$subexpression$1"],
      postprocess: function (data) {
        return data[0][0];
      },
    },
    { name: "identifier$ebnf$1", symbols: [] },
    {
      name: "identifier$ebnf$1",
      symbols: ["identifier$ebnf$1", /[a-zA-Z0-9_]/],
      postprocess: function arrpush(d) {
        return d[0].concat([d[1]]);
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
    { name: "assignment$subexpression$1", symbols: ["declaration"] },
    { name: "assignment$subexpression$1", symbols: ["identifier"] },
    { name: "assignment$subexpression$1", symbols: ["array_index"] },
    { name: "assignment$subexpression$1", symbols: ["dereference"] },
    {
      name: "assignment",
      symbols: [
        "assignment$subexpression$1",
        "_",
        { literal: "=" },
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
    { name: "function_call$subexpression$1", symbols: ["type"] },
    { name: "function_call$subexpression$1", symbols: ["statement"] },
    { name: "function_call$subexpression$1", symbols: ["_"] },
    {
      name: "function_call",
      symbols: [
        "identifier",
        "_",
        { literal: "(" },
        "_",
        "function_call$subexpression$1",
        "_",
        { literal: ")" },
      ],
      postprocess: function (data) {
        const arg = data[4][0];
        if (arg?.nodeType === undefined) {
          return {
            nodeType: "functionCall",
            functionName: data[0],
            arguments: [],
          };
        }

        return {
          nodeType: "functionCall",
          functionName: data[0],
          arguments: [data[4][0]],
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
        { literal: "[" },
        "_",
        "int",
        "_",
        { literal: "]" },
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
        { literal: "[" },
        "_",
        "statement",
        "_",
        { literal: "]" },
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
      name: "cast",
      symbols: [
        { literal: "(" },
        "_",
        "type",
        "_",
        { literal: ")" },
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
    {
      name: "dereference",
      symbols: [{ literal: "*" }, "_", "statement"],
      postprocess: function (data) {
        return {
          nodeType: "dereference",
          statement: data[2],
        };
      },
    },
    { name: "operator$subexpression$1", symbols: ["literal"] },
    { name: "operator$subexpression$1", symbols: ["identifier"] },
    { name: "operator$subexpression$1", symbols: ["function_call"] },
    { name: "operator$subexpression$1", symbols: ["parenthesis"] },
    { name: "operator$subexpression$2", symbols: ["literal"] },
    { name: "operator$subexpression$2", symbols: ["identifier"] },
    { name: "operator$subexpression$2", symbols: ["function_call"] },
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
      symbols: [{ literal: "(" }, "statement", { literal: ")" }],
      postprocess: function (data) {
        return {
          nodeType: "parenthesis",
          statement: data[1],
        };
      },
    },
    { name: "type$subexpression$1", symbols: ["type_pointer"] },
    { name: "type$subexpression$1", symbols: ["type_raw"] },
    {
      name: "type",
      symbols: ["type$subexpression$1"],
      postprocess: function (data) {
        return data[0][0];
      },
    },
    {
      name: "type_pointer$subexpression$1",
      symbols: ["type_raw", "_", { literal: "*" }],
    },
    {
      name: "type_pointer",
      symbols: ["type_pointer$subexpression$1"],
      postprocess: function (data) {
        return {
          ...data[0][0],
          isPointer: true,
        };
      },
    },
    {
      name: "type_raw$subexpression$1$string$1",
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
      name: "type_raw$subexpression$1",
      symbols: ["type_raw$subexpression$1$string$1"],
    },
    {
      name: "type_raw$subexpression$1$string$2",
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
      name: "type_raw$subexpression$1",
      symbols: ["type_raw$subexpression$1$string$2"],
    },
    {
      name: "type_raw$subexpression$1$string$3",
      symbols: [
        { literal: "u" },
        { literal: "i" },
        { literal: "n" },
        { literal: "t" },
        { literal: "6" },
        { literal: "4" },
        { literal: "_" },
        { literal: "t" },
      ],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    {
      name: "type_raw$subexpression$1",
      symbols: ["type_raw$subexpression$1$string$3"],
    },
    {
      name: "type_raw$subexpression$1$string$4",
      symbols: [
        { literal: "u" },
        { literal: "n" },
        { literal: "s" },
        { literal: "i" },
        { literal: "g" },
        { literal: "n" },
        { literal: "e" },
        { literal: "d" },
      ],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    {
      name: "type_raw$subexpression$1$string$5",
      symbols: [
        { literal: "l" },
        { literal: "o" },
        { literal: "n" },
        { literal: "g" },
      ],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    {
      name: "type_raw$subexpression$1",
      symbols: [
        "type_raw$subexpression$1$string$4",
        "_",
        "type_raw$subexpression$1$string$5",
      ],
    },
    {
      name: "type_raw$subexpression$1$string$6",
      symbols: [
        { literal: "u" },
        { literal: "i" },
        { literal: "n" },
        { literal: "t" },
        { literal: "3" },
        { literal: "2" },
        { literal: "_" },
        { literal: "t" },
      ],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    {
      name: "type_raw$subexpression$1",
      symbols: ["type_raw$subexpression$1$string$6"],
    },
    {
      name: "type_raw$subexpression$1$string$7",
      symbols: [
        { literal: "u" },
        { literal: "n" },
        { literal: "s" },
        { literal: "i" },
        { literal: "g" },
        { literal: "n" },
        { literal: "e" },
        { literal: "d" },
      ],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    {
      name: "type_raw$subexpression$1$string$8",
      symbols: [{ literal: "i" }, { literal: "n" }, { literal: "t" }],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    {
      name: "type_raw$subexpression$1",
      symbols: [
        "type_raw$subexpression$1$string$7",
        "_",
        "type_raw$subexpression$1$string$8",
      ],
    },
    {
      name: "type_raw$subexpression$1$string$9",
      symbols: [
        { literal: "u" },
        { literal: "i" },
        { literal: "n" },
        { literal: "t" },
        { literal: "1" },
        { literal: "6" },
        { literal: "_" },
        { literal: "t" },
      ],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    {
      name: "type_raw$subexpression$1",
      symbols: ["type_raw$subexpression$1$string$9"],
    },
    {
      name: "type_raw$subexpression$1$string$10",
      symbols: [
        { literal: "u" },
        { literal: "n" },
        { literal: "s" },
        { literal: "i" },
        { literal: "g" },
        { literal: "n" },
        { literal: "e" },
        { literal: "d" },
      ],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    {
      name: "type_raw$subexpression$1$string$11",
      symbols: [
        { literal: "s" },
        { literal: "h" },
        { literal: "o" },
        { literal: "r" },
        { literal: "t" },
      ],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    {
      name: "type_raw$subexpression$1",
      symbols: [
        "type_raw$subexpression$1$string$10",
        "_",
        "type_raw$subexpression$1$string$11",
      ],
    },
    {
      name: "type_raw$subexpression$1$string$12",
      symbols: [
        { literal: "u" },
        { literal: "i" },
        { literal: "n" },
        { literal: "t" },
        { literal: "8" },
        { literal: "_" },
        { literal: "t" },
      ],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    {
      name: "type_raw$subexpression$1",
      symbols: ["type_raw$subexpression$1$string$12"],
    },
    {
      name: "type_raw$subexpression$1$string$13",
      symbols: [
        { literal: "s" },
        { literal: "i" },
        { literal: "z" },
        { literal: "e" },
        { literal: "_" },
        { literal: "t" },
      ],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    {
      name: "type_raw$subexpression$1",
      symbols: ["type_raw$subexpression$1$string$13"],
    },
    {
      name: "type_raw$subexpression$1$string$14",
      symbols: [
        { literal: "u" },
        { literal: "n" },
        { literal: "s" },
        { literal: "i" },
        { literal: "g" },
        { literal: "n" },
        { literal: "e" },
        { literal: "d" },
      ],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    {
      name: "type_raw$subexpression$1$string$15",
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
      name: "type_raw$subexpression$1",
      symbols: [
        "type_raw$subexpression$1$string$14",
        "_",
        "type_raw$subexpression$1$string$15",
      ],
    },
    {
      name: "type_raw$subexpression$1$string$16",
      symbols: [
        { literal: "i" },
        { literal: "n" },
        { literal: "t" },
        { literal: "6" },
        { literal: "4" },
        { literal: "_" },
        { literal: "t" },
      ],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    {
      name: "type_raw$subexpression$1",
      symbols: ["type_raw$subexpression$1$string$16"],
    },
    {
      name: "type_raw$subexpression$1$string$17",
      symbols: [
        { literal: "l" },
        { literal: "o" },
        { literal: "n" },
        { literal: "g" },
      ],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    {
      name: "type_raw$subexpression$1",
      symbols: ["type_raw$subexpression$1$string$17"],
    },
    {
      name: "type_raw$subexpression$1$string$18",
      symbols: [
        { literal: "i" },
        { literal: "n" },
        { literal: "t" },
        { literal: "3" },
        { literal: "2" },
        { literal: "_" },
        { literal: "t" },
      ],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    {
      name: "type_raw$subexpression$1",
      symbols: ["type_raw$subexpression$1$string$18"],
    },
    {
      name: "type_raw$subexpression$1$string$19",
      symbols: [{ literal: "i" }, { literal: "n" }, { literal: "t" }],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    {
      name: "type_raw$subexpression$1",
      symbols: ["type_raw$subexpression$1$string$19"],
    },
    {
      name: "type_raw$subexpression$1$string$20",
      symbols: [
        { literal: "i" },
        { literal: "n" },
        { literal: "t" },
        { literal: "1" },
        { literal: "6" },
        { literal: "_" },
        { literal: "t" },
      ],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    {
      name: "type_raw$subexpression$1",
      symbols: ["type_raw$subexpression$1$string$20"],
    },
    {
      name: "type_raw$subexpression$1$string$21",
      symbols: [
        { literal: "s" },
        { literal: "h" },
        { literal: "o" },
        { literal: "r" },
        { literal: "t" },
      ],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    {
      name: "type_raw$subexpression$1",
      symbols: ["type_raw$subexpression$1$string$21"],
    },
    {
      name: "type_raw$subexpression$1$string$22",
      symbols: [
        { literal: "i" },
        { literal: "n" },
        { literal: "t" },
        { literal: "8" },
        { literal: "_" },
        { literal: "t" },
      ],
      postprocess: function joiner(d) {
        return d.join("");
      },
    },
    {
      name: "type_raw$subexpression$1",
      symbols: ["type_raw$subexpression$1$string$22"],
    },
    {
      name: "type_raw$subexpression$1$string$23",
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
      name: "type_raw$subexpression$1",
      symbols: ["type_raw$subexpression$1$string$23"],
    },
    {
      name: "type_raw$subexpression$1$string$24",
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
      name: "type_raw$subexpression$1",
      symbols: ["type_raw$subexpression$1$string$24"],
    },
    {
      name: "type_raw",
      symbols: ["type_raw$subexpression$1"],
      postprocess: function (data) {
        let type;
        type = data[0][0];

        if (type === "size_t") {
          type = "uint8_t";
        } else if (data[0][0] === "unsigned") {
          type = data[0][2];

          if (type === "char") {
            type = "uint8_t";
          } else if (type === "short") {
            type = "uint16_t";
          } else if (type === "int") {
            type = "uint32_t";
          } else if (type === "long") {
            type = "uint64_t";
          }
        } else if (type === "char") {
          type = "int8_t";
        } else if (type === "short") {
          type = "int16_t";
        } else if (type === "int") {
          type = "int32_t";
        } else if (type === "long") {
          type = "int64_t";
        }

        return {
          nodeType: "type",
          type: type,
          isPointer: false,
        };
      },
    },
    { name: "literal$subexpression$1", symbols: ["int"] },
    { name: "literal$subexpression$1", symbols: ["double"] },
    { name: "literal$subexpression$1", symbols: ["doubleNegative"] },
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
    { name: "int$subexpression$1", symbols: ["intDecimal"] },
    { name: "int$subexpression$1", symbols: ["intDecimalNegative"] },
    { name: "int$subexpression$1", symbols: ["intHex"] },
    {
      name: "int",
      symbols: ["int$subexpression$1"],
      postprocess: function (data) {
        return data[0][0];
      },
    },
    {
      name: "intDecimalNegative",
      symbols: [{ literal: "-" }, "intDecimal"],
      postprocess: function (data) {
        return {
          nodeType: "integer",
          value: -data[1].value,
        };
      },
    },
    { name: "intDecimal$subexpression$1$ebnf$1", symbols: [/[0-9]/] },
    {
      name: "intDecimal$subexpression$1$ebnf$1",
      symbols: ["intDecimal$subexpression$1$ebnf$1", /[0-9]/],
      postprocess: function arrpush(d) {
        return d[0].concat([d[1]]);
      },
    },
    {
      name: "intDecimal$subexpression$1",
      symbols: ["intDecimal$subexpression$1$ebnf$1"],
    },
    {
      name: "intDecimal",
      symbols: ["intDecimal$subexpression$1"],
      postprocess: function (data) {
        return {
          nodeType: "integer",
          value: parseInt(data[0].join().replace(/,/g, "")),
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
      symbols: ["intHex$ebnf$1", /[0-9a-fA-F]/],
      postprocess: function arrpush(d) {
        return d[0].concat([d[1]]);
      },
    },
    {
      name: "intHex",
      symbols: ["intHex$string$1", "intHex$ebnf$1"],
      postprocess: function (data) {
        return {
          nodeType: "integer",
          value: parseInt(data[1].join().replace(/,/g, ""), 16),
        };
      },
    },
    {
      name: "doubleNegative",
      symbols: [{ literal: "-" }, "double"],
      postprocess: function (data) {
        return {
          nodeType: "double",
          value: -data[1].value,
        };
      },
    },
    { name: "double$ebnf$1", symbols: [/[0-9]/] },
    {
      name: "double$ebnf$1",
      symbols: ["double$ebnf$1", /[0-9]/],
      postprocess: function arrpush(d) {
        return d[0].concat([d[1]]);
      },
    },
    { name: "double$ebnf$2", symbols: [] },
    {
      name: "double$ebnf$2",
      symbols: ["double$ebnf$2", /[0-9]/],
      postprocess: function arrpush(d) {
        return d[0].concat([d[1]]);
      },
    },
    {
      name: "double",
      symbols: ["double$ebnf$1", { literal: "." }, "double$ebnf$2"],
      postprocess: function (data) {
        return {
          nodeType: "double",
          value: parseFloat(
            data[0].join().replace(/,/g, "") +
              "." +
              data[2].join().replace(/,/g, "")
          ),
        };
      },
    },
    { name: "string$ebnf$1", symbols: [] },
    {
      name: "string$ebnf$1",
      symbols: ["string$ebnf$1", /[^"]/],
      postprocess: function arrpush(d) {
        return d[0].concat([d[1]]);
      },
    },
    {
      name: "string",
      symbols: [{ literal: '"' }, "string$ebnf$1", { literal: '"' }],
      postprocess: function (data) {
        return {
          nodeType: "string",
          value: data[1].join().replace(/,/g, ""),
        };
      },
    },
    {
      name: "char",
      symbols: [{ literal: "'" }, /[^']/, { literal: "'" }],
      postprocess: function (data) {
        return {
          nodeType: "integer",
          value: data[1].charCodeAt(0),
        };
      },
    },
    { name: "_$ebnf$1", symbols: [] },
    {
      name: "_$ebnf$1",
      symbols: ["_$ebnf$1", /[ ]/],
      postprocess: function arrpush(d) {
        return d[0].concat([d[1]]);
      },
    },
    {
      name: "_",
      symbols: ["_$ebnf$1"],
      postprocess: function () {
        return null;
      },
    },
  ],
  ParserStart: "Main",
};
export default grammar;
