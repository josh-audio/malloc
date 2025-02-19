Main -> ((statement _) | (statement _ ";")) {%
  function(data) {
    return data[0][0][0]
  }
%}

statement -> (literal | identifier | assignment | function_call | declaration | cast | array_index | operator | parenthesis ) {%
  function(data) {
    return data[0][0]
  }
%}

intDecimal -> [0-9]:+ {%
  function(data) {
    return {
      nodeType: 'int',
      int: data[0].join().replace(/,/g, '')
    }
  }
%}

intHex -> "0x" [0-9a-fA-F]:+ {%
  function(data) {
    return {
      nodeType: 'int',
      int: parseInt(data[1].join().replace(/,/g, ''), 16).toString()
    }
  }
%}

int -> (intDecimal | intHex) {%
  function(data) {
    return data[0][0]
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

function_call -> identifier _ "(" _ ( statement | _ ) _ ")" {%
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

operator -> (literal | identifier | function_call | parenthesis) _ [+\-*\/] _ (literal | identifier | function_call | parenthesis) {%
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
