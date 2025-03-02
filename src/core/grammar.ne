Main -> ((statement _) | (statement _ ";")) {%
  function(data) {
    return data[0][0][0]
  }
%}

statement -> (
  literal 
  | identifier 
  | assignment 
  | function_call 
  | declaration 
  | cast 
  | array_index 
  | operator 
  | parenthesis
  | dereference
  | type
) {%
  function(data) {
    return data[0][0]
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

assignment -> (declaration | identifier | array_index | dereference) _ "=" _ statement {%
  function(data) {
    return {
      nodeType: 'assignment',
      left: data[0][0],
      right: data[4]
    }
  }
%}

function_call -> identifier _ "(" _ ( type | statement | _ ) _ ")" {%
  function(data) {
    const arg = data[4][0];
    if (arg?.nodeType === undefined) {
      return {
        nodeType: 'functionCall',
        functionName: data[0],
        arguments: []
      }
    }

    return {
      nodeType: 'functionCall',
      functionName: data[0],
      arguments: [data[4][0]]
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

cast -> "(" _ type _ ")" _ statement {%
  function(data) {
    return {
      nodeType: 'cast',
      type: data[2],
      statement: data[6]
    }
  }
%}

dereference -> "*" _ statement {%
  function(data) {
    return {
      nodeType: 'dereference',
      statement: data[2]
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

type -> ( type_pointer | type_raw ) {%
  function(data) {
    return data[0][0]
  }
%}

type_pointer -> ( type_raw _ "*" ) {%
  function(data) {
    return {
      ...data[0][0],
      isPointer: true,
    }
  }
%}

type_raw -> (
  "double"
  | "string" 
  | "uint32_t" | "int"
  | "uint8_t" | "size_t" | "char"
  | "void"
) {%
  function(data) {
    let type;
    type = data[0][0];

    if (type === 'size_t' || type === 'char') {
      type = 'uint8_t';
    } else if (type === 'int') {
      type = 'uint32_t';
    }

    return {
      nodeType: 'type',
      type: type,
      isPointer: false,
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

int -> (intDecimal | intHex) {%
  function(data) {
    return data[0][0]
  }
%}

intDecimal -> [0-9]:+ {%
  function(data) {
    return {
      nodeType: 'uint32_t',
      value: parseInt(data[0].join().replace(/,/g, ''))
    }
  }
%}

intHex -> "0x" [0-9a-fA-F]:+ {%
  function(data) {
    return {
      nodeType: 'uint32_t',
      value: parseInt(data[1].join().replace(/,/g, ''), 16)
    }
  }
%}

double -> [0-9]:+ "." [0-9]:* {%
  function(data) {
    return {
      nodeType: 'double',
      value: parseFloat(data[0].join().replace(/,/g, '') + '.' + data[2].join().replace(/,/g, ''))
    }
  }
%}

string -> "\"" [^"]:* "\"" {%
  function(data) {
    return {
      nodeType: 'string',
      value: data[1].join().replace(/,/g, '')
    }
  }
%}

char -> "'" [^'] "'" {%
  function(data) {
    return {
      nodeType: 'uint8_t',
      value: data[1].charCodeAt(0)
    }
  }
%}

_ -> [ ]:* {%
  function() {
    return null;
  }
%}
