/* eslint-disable @typescript-eslint/no-unused-vars */

/*
  Main -> ((statement _) | (statement _ ";")) {%
    function(data) {
      return data[0][0][0]
    }
  %}

  statement -> (literal | identifier | assignment | functionCall | declaration | cast | array_index | operator | parenthesis | _) {%
    function(data) {
      return data[0][0]
    }
  %}

  int -> [0-9]:+ {%
    function(data) {
      return {
        nodeType: 'int',
        int: data[0].join().replace(/,/g, '')
      }
    }
  %}

  double -> [0-9]:+ "." [^']:* {%
    function(data) {
      return {
        nodeType: 'double',
        double: data[0].join().replace(/,/g, '') + '.' + data[2].join().replace(/,/g, '')
      }
    }
  %}

  string -> "\"" [^"]:* "\"" {%
    function(data) {
      return {
        nodeType: 'string',
        string: data[1].join().replace(/,/g, '')
      }
    }
  %}

  char -> "'" [^'] "'" {%
    function(data) {
      return {
        nodeType: 'char',
        char: data[1]
      }
    }
  %}

  literal -> (int | double | string | char) {%
    function(data) {
      return {
        nodeType: 'literal',
        literal: data[0][0],
      }
    }
  %}

  identifier -> [a-zA-Z_] [a-zA-Z0-9_]:* {%
    function(data) {
      return {
        nodeType: 'identifier',
        identifier: (data[0] + data[1]).replace(/,/g, '')
      }
    }
  %}

  _ -> [ ]:* {%
    function(data) {
      return null;
    }
  %}

  assignment -> (declaration | identifier | array_index) _ "=" _ statement {%
    function(data) {
      return {
        nodeType: 'assignment',
        left: data[0][0],
        right: data[4]
      }
    }
  %}

  functionCall -> identifier _ "(" _ statement _ ")" {%
    function(data) {
      return {
        nodeType: 'functionCall',
        functionName: data[0],
        argument: data[4]
      }
    }
  %}

  declaration -> (single_declaration | array_declaration) {%
    function(data) {
      return {
        nodeType: 'declaration',
        declaration: data[0][0],
      }
    }
  %}

  single_declaration -> (type _ identifier) {%
    function(data) {
      return {
        nodeType: 'singleDeclaration',
        type: data[0][0],
        identifier: data[0][2]
      }
    }
  %}

  array_declaration -> type _ identifier _ "[" _ int _ "]" {%
    function(data) {
      return {
        nodeType: 'arrayDeclaration',
        type: data[0],
        identifier: data[2],
        size: data[6],
      }
    }
  %}

  array_index -> identifier _ "[" _ statement _ "]" {%
    function(data) {
      return {
        nodeType: 'arrayIndex',
        identifier: data[0],
        value: data[4]
      }
    }
  %}

  type -> ("int" | "int" _ "*" | "double" | "double" _ "*" | "string" | "char" | "char" _ "*" | "void" | "void" _ "*") {%
    function(data) {
      let type;
      if (data[0].length > 1) {
        type = data[0][0] + data[0][2];
      }
      else {
        type = data[0][0];
      }
      return {
        nodeType: 'type',
        type: type
      }
    }
  %}

  cast -> "(" _ type _ ")" _ statement {%
    function(data) {
      return {
        nodeType: 'cast',
        type: data[2],
        statement: data[6]
      }
    }
  %}

  operator -> (literal | identifier | functionCall | parenthesis) _ [+\-*\/] _ (literal | identifier | functionCall | parenthesis) {%
    function(data) {
      return {
        nodeType: 'operator',
        left: data[0][0],
        operator: data[2],
        right: data[4][0]
      }
    }
  %}

  parenthesis -> "(" statement ")" {%
    function(data) {
      return {
        nodeType: 'parenthesis',
        statement: data[1]
      }
    }
  %}
*/

const rules: nearley.CompiledRules = {
  Lexer: undefined,
  ParserRules: [
    {
      name: 'Main$subexpression$1$subexpression$1',
      symbols: ['statement', '_']
    },
    {
      name: 'Main$subexpression$1',
      symbols: ['Main$subexpression$1$subexpression$1']
    },
    {
      name: 'Main$subexpression$1$subexpression$2',
      symbols: ['statement', '_', { literal: ';', pos: 18 }]
    },
    {
      name: 'Main$subexpression$1',
      symbols: ['Main$subexpression$1$subexpression$2']
    },
    {
      name: 'Main',
      symbols: ['Main$subexpression$1'],
      postprocess: function(data) {
        return data[0][0][0];
      }
    },
    { name: 'statement$subexpression$1', symbols: ['literal'] },
    { name: 'statement$subexpression$1', symbols: ['identifier'] },
    { name: 'statement$subexpression$1', symbols: ['assignment'] },
    { name: 'statement$subexpression$1', symbols: ['functionCall'] },
    { name: 'statement$subexpression$1', symbols: ['declaration'] },
    { name: 'statement$subexpression$1', symbols: ['cast'] },
    { name: 'statement$subexpression$1', symbols: ['array_index'] },
    { name: 'statement$subexpression$1', symbols: ['operator'] },
    { name: 'statement$subexpression$1', symbols: ['parenthesis'] },
    { name: 'statement$subexpression$1', symbols: ['_'] },
    {
      name: 'statement',
      symbols: ['statement$subexpression$1'],
      postprocess: function(data) {
        return data[0][0];
      }
    },
    { name: 'int$ebnf$1', symbols: [/[0-9]/] },
    {
      name: 'int$ebnf$1',
      symbols: [/[0-9]/, 'int$ebnf$1'],
      postprocess: function arrconcat(d) {
        return [d[0]].concat(d[1]);
      }
    },
    {
      name: 'int',
      symbols: ['int$ebnf$1'],
      postprocess: function(data) {
        return {
          nodeType: 'int',
          int: data[0].join().replace(/,/g, '')
        };
      }
    },
    { name: 'double$ebnf$1', symbols: [/[0-9]/] },
    {
      name: 'double$ebnf$1',
      symbols: [/[0-9]/, 'double$ebnf$1'],
      postprocess: function arrconcat(d) {
        return [d[0]].concat(d[1]);
      }
    },
    { name: 'double$ebnf$2', symbols: [] },
    {
      name: 'double$ebnf$2',
      symbols: [/[^']/, 'double$ebnf$2'],
      postprocess: function arrconcat(d) {
        return [d[0]].concat(d[1]);
      }
    },
    {
      name: 'double',
      symbols: ['double$ebnf$1', { literal: '.', pos: 86 }, 'double$ebnf$2'],
      postprocess: function(data) {
        return {
          nodeType: 'double',
          double:
            data[0].join().replace(/,/g, '') + '.' + data[2].join().replace(/,/g, '')
        };
      }
    },
    { name: 'string$ebnf$1', symbols: [] },
    {
      name: 'string$ebnf$1',
      symbols: [/[^"]/, 'string$ebnf$1'],
      postprocess: function arrconcat(d) {
        return [d[0]].concat(d[1]);
      }
    },
    {
      name: 'string',
      symbols: [{ literal: '"', pos: 97 }, 'string$ebnf$1', { literal: '"', pos: 102 }],
      postprocess: function(data) {
        return {
          nodeType: 'string',
          string: data[1].join().replace(/,/g, '')
        };
      }
    },
    {
      name: 'char',
      symbols: [{ literal: "'", pos: 110 }, /[^']/, { literal: "'", pos: 114 }],
      postprocess: function(data) {
        return {
          nodeType: 'char',
          char: data[1]
        };
      }
    },
    { name: 'literal$subexpression$1', symbols: ['int'] },
    { name: 'literal$subexpression$1', symbols: ['double'] },
    { name: 'literal$subexpression$1', symbols: ['string'] },
    { name: 'literal$subexpression$1', symbols: ['char'] },
    {
      name: 'literal',
      symbols: ['literal$subexpression$1'],
      postprocess: function(data) {
        return {
          nodeType: 'literal',
          literal: data[0][0]
        };
      }
    },
    { name: 'identifier$ebnf$1', symbols: [] },
    {
      name: 'identifier$ebnf$1',
      symbols: [/[a-zA-Z0-9_]/, 'identifier$ebnf$1'],
      postprocess: function arrconcat(d) {
        return [d[0]].concat(d[1]);
      }
    },
    {
      name: 'identifier',
      symbols: [/[a-zA-Z_]/, 'identifier$ebnf$1'],
      postprocess: function(data) {
        return {
          nodeType: 'identifier',
          identifier: (data[0] + data[1]).replace(/,/g, '')
        };
      }
    },
    { name: '_$ebnf$1', symbols: [] },
    {
      name: '_$ebnf$1',
      symbols: [/[ ]/, '_$ebnf$1'],
      postprocess: function arrconcat(d) {
        return [d[0]].concat(d[1]);
      }
    },
    {
      name: '_',
      symbols: ['_$ebnf$1'],
      postprocess: function(_) {
        return null;
      }
    },
    { name: 'assignment$subexpression$1', symbols: ['declaration'] },
    { name: 'assignment$subexpression$1', symbols: ['identifier'] },
    { name: 'assignment$subexpression$1', symbols: ['array_index'] },
    {
      name: 'assignment',
      symbols: [
        'assignment$subexpression$1',
        '_',
        { literal: '=', pos: 178 },
        '_',
        'statement'
      ],
      postprocess: function(data) {
        return {
          nodeType: 'assignment',
          left: data[0][0],
          right: data[4]
        };
      }
    },
    {
      name: 'functionCall',
      symbols: [
        'identifier',
        '_',
        { literal: '(', pos: 194 },
        '_',
        'statement',
        '_',
        { literal: ')', pos: 202 }
      ],
      postprocess: function(data) {
        return {
          nodeType: 'functionCall',
          functionName: data[0],
          argument: data[4]
        };
      }
    },
    {
      name: 'declaration$subexpression$1',
      symbols: ['single_declaration']
    },
    { name: 'declaration$subexpression$1', symbols: ['array_declaration'] },
    {
      name: 'declaration',
      symbols: ['declaration$subexpression$1'],
      postprocess: function(data) {
        return {
          nodeType: 'declaration',
          declaration: data[0][0]
        };
      }
    },
    {
      name: 'single_declaration$subexpression$1',
      symbols: ['type', '_', 'identifier']
    },
    {
      name: 'single_declaration',
      symbols: ['single_declaration$subexpression$1'],
      postprocess: function(data) {
        return {
          nodeType: 'singleDeclaration',
          type: data[0][0],
          identifier: data[0][2]
        };
      }
    },
    {
      name: 'array_declaration',
      symbols: [
        'type',
        '_',
        'identifier',
        '_',
        { literal: '[', pos: 246 },
        '_',
        'int',
        '_',
        { literal: ']', pos: 254 }
      ],
      postprocess: function(data) {
        return {
          nodeType: 'arrayDeclaration',
          type: data[0],
          identifier: data[2],
          size: data[6]
        };
      }
    },
    {
      name: 'array_index',
      symbols: [
        'identifier',
        '_',
        { literal: '[', pos: 266 },
        '_',
        'statement',
        '_',
        { literal: ']', pos: 274 }
      ],
      postprocess: function(data) {
        return {
          nodeType: 'arrayIndex',
          identifier: data[0],
          value: data[4]
        };
      }
    },
    {
      name: 'type$subexpression$1$string$1',
      symbols: [{ literal: 'i' }, { literal: 'n' }, { literal: 't' }],
      postprocess: function joiner(d) {
        return d.join('');
      }
    },
    {
      name: 'type$subexpression$1',
      symbols: ['type$subexpression$1$string$1']
    },
    {
      name: 'type$subexpression$1$string$2',
      symbols: [{ literal: 'i' }, { literal: 'n' }, { literal: 't' }],
      postprocess: function joiner(d) {
        return d.join('');
      }
    },
    {
      name: 'type$subexpression$1',
      symbols: ['type$subexpression$1$string$2', '_', { literal: '*', pos: 291 }]
    },
    {
      name: 'type$subexpression$1$string$3',
      symbols: [
        { literal: 'd' },
        { literal: 'o' },
        { literal: 'u' },
        { literal: 'b' },
        { literal: 'l' },
        { literal: 'e' }
      ],
      postprocess: function joiner(d) {
        return d.join('');
      }
    },
    {
      name: 'type$subexpression$1',
      symbols: ['type$subexpression$1$string$3']
    },
    {
      name: 'type$subexpression$1$string$4',
      symbols: [
        { literal: 'd' },
        { literal: 'o' },
        { literal: 'u' },
        { literal: 'b' },
        { literal: 'l' },
        { literal: 'e' }
      ],
      postprocess: function joiner(d) {
        return d.join('');
      }
    },
    {
      name: 'type$subexpression$1',
      symbols: ['type$subexpression$1$string$4', '_', { literal: '*', pos: 303 }]
    },
    {
      name: 'type$subexpression$1$string$5',
      symbols: [
        { literal: 's' },
        { literal: 't' },
        { literal: 'r' },
        { literal: 'i' },
        { literal: 'n' },
        { literal: 'g' }
      ],
      postprocess: function joiner(d) {
        return d.join('');
      }
    },
    {
      name: 'type$subexpression$1',
      symbols: ['type$subexpression$1$string$5']
    },
    {
      name: 'type$subexpression$1$string$6',
      symbols: [{ literal: 'c' }, { literal: 'h' }, { literal: 'a' }, { literal: 'r' }],
      postprocess: function joiner(d) {
        return d.join('');
      }
    },
    {
      name: 'type$subexpression$1',
      symbols: ['type$subexpression$1$string$6']
    },
    {
      name: 'type$subexpression$1$string$7',
      symbols: [{ literal: 'c' }, { literal: 'h' }, { literal: 'a' }, { literal: 'r' }],
      postprocess: function joiner(d) {
        return d.join('');
      }
    },
    {
      name: 'type$subexpression$1',
      symbols: ['type$subexpression$1$string$7', '_', { literal: '*', pos: 319 }]
    },
    {
      name: 'type$subexpression$1$string$8',
      symbols: [{ literal: 'v' }, { literal: 'o' }, { literal: 'i' }, { literal: 'd' }],
      postprocess: function joiner(d) {
        return d.join('');
      }
    },
    {
      name: 'type$subexpression$1',
      symbols: ['type$subexpression$1$string$8']
    },
    {
      name: 'type$subexpression$1$string$9',
      symbols: [{ literal: 'v' }, { literal: 'o' }, { literal: 'i' }, { literal: 'd' }],
      postprocess: function joiner(d) {
        return d.join('');
      }
    },
    {
      name: 'type$subexpression$1',
      symbols: ['type$subexpression$1$string$9', '_', { literal: '*', pos: 331 }]
    },
    {
      name: 'type',
      symbols: ['type$subexpression$1'],
      postprocess: function(data) {
        let type;
        if (data[0].length > 1) {
          type = data[0][0] + data[0][2];
        } else {
          type = data[0][0];
        }
        return {
          nodeType: 'type',
          type: type
        };
      }
    },
    {
      name: 'cast',
      symbols: [
        { literal: '(', pos: 340 },
        '_',
        'type',
        '_',
        { literal: ')', pos: 348 },
        '_',
        'statement'
      ],
      postprocess: function(data) {
        return {
          nodeType: 'cast',
          type: data[2],
          statement: data[6]
        };
      }
    },
    { name: 'operator$subexpression$1', symbols: ['literal'] },
    { name: 'operator$subexpression$1', symbols: ['identifier'] },
    { name: 'operator$subexpression$1', symbols: ['functionCall'] },
    { name: 'operator$subexpression$1', symbols: ['parenthesis'] },
    { name: 'operator$subexpression$2', symbols: ['literal'] },
    { name: 'operator$subexpression$2', symbols: ['identifier'] },
    { name: 'operator$subexpression$2', symbols: ['functionCall'] },
    { name: 'operator$subexpression$2', symbols: ['parenthesis'] },
    {
      name: 'operator',
      symbols: ['operator$subexpression$1', '_', /[+\-*/]/, '_', 'operator$subexpression$2'],
      postprocess: function(data) {
        return {
          nodeType: 'operator',
          left: data[0][0],
          operator: data[2],
          right: data[4][0]
        };
      }
    },
    {
      name: 'parenthesis',
      symbols: [{ literal: '(', pos: 404 }, 'statement', { literal: ')', pos: 408 }],
      postprocess: function(data) {
        return {
          nodeType: 'parenthesis',
          statement: data[1]
        };
      }
    }
  ],
  ParserStart: 'Main'
};

export default rules;
