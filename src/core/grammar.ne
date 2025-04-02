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
  | array_access 
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

assignment -> (declaration | identifier | array_access | dereference) _ "=" _ statement {%
  function(data) {
    return {
      nodeType: 'assignment',
      left: data[0][0],
      right: data[4]
    }
  }
%}

function_call -> identifier _ "(" _ ( statement | _ ) (_ "," _ statement):* _ ")" {%
  function(data) {
    const arg1 = data[4][0];
    const rest = data[5];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const args = [arg1, ...rest.map((item: any) => item[3])]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((item: any) => item !== null);

    return {
      nodeType: 'functionCall',
      functionName: data[0],
      arguments: args,
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

array_access -> identifier _ "[" _ statement _ "]" {%
  function(data) {
    return {
      nodeType: 'arrayAccess',
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

operator -> (literal | identifier | function_call | parenthesis | dereference | array_access) _ [+\-*\/] _ (literal | identifier | function_call | parenthesis | dereference | array_access) {%
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
  "bool"
  | "double" | "float"
  | "string"
  | "uint64_t" | "unsigned" _ "long"
  | "uint32_t" | "unsigned" _ "int"
  | "uint16_t" | "unsigned" _ "short"
  | "uint8_t" | "size_t" | "unsigned" _ "char"
  | "int64_t" | "long"
  | "int32_t" | "int"
  | "int16_t" | "short"
  | "int8_t" | "char"
  | "void"
) {%
  function(data) {
    let type;
    type = data[0][0];

    if (type === 'size_t') {
      type = 'uint8_t';
    }

    else if (data[0][0] === 'unsigned') {
      type = data[0][2];

      if (type === 'char') {
        type = 'uint8_t';
      } else if (type === 'short') {
        type = 'uint16_t';
      } else if (type === 'int') {
        type = 'uint32_t';
      } else if (type === 'long') {
        type = 'uint64_t';
      }
    }
    
    else if (type === 'char') {
      type = 'int8_t';
    } else if (type === 'short') {
      type = 'int16_t';
    } else if (type === 'int') {
      type = 'int32_t';
    } else if (type === 'long') {
      type = 'int64_t';
    }

    return {
      nodeType: 'type',
      type: type,
      isPointer: false,
    }
  }
%}

literal -> (int | double | doubleNegative | string | char | bool) {%
  function(data) {
    return {
      nodeType: 'literal',
      literal: data[0][0],
    }
  }
%}

int -> (intDecimal | intDecimalNegative | intHex) {%
  function(data) {
    return data[0][0]
  }
%}

intDecimalNegative -> "-" intDecimal {%
  function(data) {
    return {
      nodeType: 'integer',
      value: -data[1].value
    }
  }
%}

intDecimal -> ([0-9]:+) {%
  function(data) {
    return {
      nodeType: 'integer',
      value: parseInt(data[0].join().replace(/,/g, ''))
    }
  }
%}

intHex -> "0x" [0-9a-fA-F]:+ {%
  function(data) {
    return {
      nodeType: 'integer',
      value: parseInt(data[1].join().replace(/,/g, ''), 16)
    }
  }
%}

doubleNegative -> "-" double {%
  function(data) {
    return {
      nodeType: 'double',
      value: -data[1].value
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
      nodeType: 'integer',
      value: data[1].charCodeAt(0)
    }
  }
%}

bool -> ("true" | "false") {%
  function(data) {
    return {
      nodeType: 'boolean',
      value: data[0] === 'true'
    }
  }
%}

_ -> [ ]:* {%
  function() {
    return null;
  }
%}
