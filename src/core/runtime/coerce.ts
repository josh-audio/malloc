import { LiteralNode, TypeNode } from "../grammar_output_validator";
import { RuntimeValueNode } from "./engine";

const coerceLiteralToInt = (value: LiteralNode): LiteralNode => {
  if (value.literal.nodeType === "int") {
    return value;
  } else if (value.literal.nodeType === "double") {
    return {
      nodeType: "literal",
      literal: {
        nodeType: "int",
        int: Math.floor(value.literal.double),
      },
    };
  } else if (value.literal.nodeType === "char") {
    return {
      nodeType: "literal",
      literal: {
        nodeType: "int",
        int: value.literal.char,
      },
    };
  } else {
    throw Error(
      `Runtime error: Cannot coerce ${value.literal.nodeType} to int.`
    );
  }
};

const coerceLiteralToDouble = (value: LiteralNode): LiteralNode => {
  if (value.literal.nodeType === "double") {
    return value;
  } else if (value.literal.nodeType === "int") {
    return {
      nodeType: "literal",
      literal: {
        nodeType: "double",
        double: value.literal.int,
      },
    };
  } else {
    throw Error(
      `Runtime error: Cannot coerce ${value.literal.nodeType} to double.`
    );
  }
};

const coerceLiteralToChar = (value: LiteralNode): LiteralNode => {
  if (value.literal.nodeType === "char") {
    return value;
  } else if (value.literal.nodeType === "string") {
    return {
      nodeType: "literal",
      literal: {
        nodeType: "char",
        char: value.literal.string.charCodeAt(0),
      },
    };
  } else if (value.literal.nodeType === "int") {
    return {
      nodeType: "literal",
      literal: {
        nodeType: "char",
        char: value.literal.int & 0xff,
      },
    };
  } else {
    throw Error(
      `Runtime error: Cannot coerce ${value.literal.nodeType} to char.`
    );
  }
};

const coerceLiteralToString = (value: LiteralNode): LiteralNode => {
  if (value.literal.nodeType === "string") {
    return value;
  } else if (value.literal.nodeType === "char") {
    return {
      nodeType: "literal",
      literal: {
        nodeType: "string",
        string: String.fromCharCode(value.literal.char),
      },
    };
  } else {
    throw Error(
      `Runtime error: Cannot coerce ${value.literal.nodeType} to string.`
    );
  }
};

const coerce = (value: RuntimeValueNode, type: TypeNode): RuntimeValueNode => {
  if (value.value.nodeType !== "literal") {
    throw Error(
      `Internal error: coerce: Unexpected value node with type: "${value.value.nodeType}".`
    );
  }

  if (type.type === "int") {
    return {
      nodeType: "runtimeValue",
      type: type,
      value: coerceLiteralToInt(value.value),
    };
  } else if (type.type === "double") {
    return {
      nodeType: "runtimeValue",
      type: type,
      value: coerceLiteralToDouble(value.value),
    };
  } else if (type.type === "char" || type.type.includes("*")) {
    return {
      nodeType: "runtimeValue",
      type: type,
      value: coerceLiteralToChar(value.value),
    };
  } else if (type.type === "string") {
    return {
      nodeType: "runtimeValue",
      type: type,
      value: coerceLiteralToString(value.value),
    };
  } else {
    throw Error(
      `Internal error: Unexpected type node with type: "${type.nodeType}".`
    );
  }
};

export {
  coerceLiteralToInt,
  coerceLiteralToDouble,
  coerceLiteralToChar,
  coerceLiteralToString,
  coerce,
};
