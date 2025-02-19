import { LiteralNode } from "../grammar_output_validator";

const coerceToInt = (value: LiteralNode): LiteralNode => {
  if (value.literal.nodeType === "int") {
    return value;
  } else if (value.literal.nodeType === "double") {
    return {
      nodeType: "literal",
      literal: {
        nodeType: "int",
        int: Math.floor(parseFloat(value.literal.double)).toString(),
      },
    };
  } else if (value.literal.nodeType === "char") {
    return {
      nodeType: "literal",
      literal: {
        nodeType: "int",
        int: value.literal.char.charCodeAt(0).toString(),
      },
    };
  } else {
    throw Error(
      `Runtime error: Cannot coerce ${value.literal.nodeType} to int.`
    );
  }
};

const coerceToDouble = (value: LiteralNode): LiteralNode => {
  if (value.literal.nodeType === "double") {
    return value;
  } else if (value.literal.nodeType === "int") {
    return {
      nodeType: "literal",
      literal: {
        nodeType: "double",
        double: parseFloat(value.literal.int).toString(),
      },
    };
  } else {
    throw Error(
      `Runtime error: Cannot coerce ${value.literal.nodeType} to double.`
    );
  }
};

const coerceToChar = (value: LiteralNode): LiteralNode => {
  if (value.literal.nodeType === "char") {
    return value;
  } else if (value.literal.nodeType === "string") {
    return {
      nodeType: "literal",
      literal: {
        nodeType: "char",
        char: value.literal.string[0],
      },
    };
  } else if (value.literal.nodeType === "int") {
    return {
      nodeType: "literal",
      literal: {
        nodeType: "char",
        char: String.fromCharCode(parseInt(value.literal.int)),
      },
    };
  } else {
    throw Error(
      `Runtime error: Cannot coerce ${value.literal.nodeType} to char.`
    );
  }
};

const coerceToString = (value: LiteralNode): LiteralNode => {
  if (value.literal.nodeType === "string") {
    return value;
  } else if (value.literal.nodeType === "char") {
    return {
      nodeType: "literal",
      literal: {
        nodeType: "string",
        string: value.literal.char,
      },
    };
  } else {
    throw Error(
      `Runtime error: Cannot coerce ${value.literal.nodeType} to string.`
    );
  }
};

export { coerceToInt, coerceToDouble, coerceToChar, coerceToString };
