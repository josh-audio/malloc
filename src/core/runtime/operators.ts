import { LiteralNode } from "../grammar_output_validator";
import {
  coerceLiteralToDouble,
  coerceLiteralToInt,
  coerceLiteralToString,
} from "./coerce";

////////////////////////
// Operator +         //
////////////////////////

const intOperatorPlus = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  if (left.literal.nodeType !== "int" || right.literal.nodeType !== "int") {
    throw Error("Internal error: Unexpected literal node type.");
  }

  return {
    nodeType: "literal",
    literal: {
      nodeType: "int",
      int: (
        parseInt(left.literal.int) + parseInt(right.literal.int)
      ).toString(),
    },
  };
};

const doubleOperatorPlus = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  if (
    left.literal.nodeType !== "double" ||
    right.literal.nodeType !== "double"
  ) {
    throw Error("Internal error: Unexpected literal node type.");
  }

  return {
    nodeType: "literal",
    literal: {
      nodeType: "double",
      double: (
        parseFloat(left.literal.double) + parseFloat(right.literal.double)
      ).toString(),
    },
  };
};

const charOperatorPlus = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  if (left.literal.nodeType !== "char" || right.literal.nodeType !== "char") {
    throw Error("Internal error: Unexpected literal node type.");
  }

  return {
    nodeType: "literal",
    literal: {
      nodeType: "char",
      char: String.fromCharCode(
        left.literal.char.charCodeAt(0) + right.literal.char.charCodeAt(0)
      ),
    },
  };
};

const stringOperatorPlus = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  if (
    left.literal.nodeType !== "string" ||
    right.literal.nodeType !== "string"
  ) {
    throw Error("Internal error: Unexpected literal node type.");
  }

  return {
    nodeType: "literal",
    literal: {
      nodeType: "string",
      string: left.literal.string + right.literal.string,
    },
  };
};

const coerceOperatorPlus = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  const leftIsNumeric =
    left.literal.nodeType === "int" || left.literal.nodeType === "double";
  const rightIsNumeric =
    right.literal.nodeType === "int" || right.literal.nodeType === "double";
  const bothInt =
    left.literal.nodeType === "int" && right.literal.nodeType === "int";

  if (leftIsNumeric && rightIsNumeric) {
    if (bothInt) {
      return intOperatorPlus(left, right);
    } else {
      return doubleOperatorPlus(
        coerceLiteralToDouble(left),
        coerceLiteralToDouble(right)
      );
    }
  }

  const leftIsChar = left.literal.nodeType === "char";
  const rightIsChar = right.literal.nodeType === "char";
  const bothChar = leftIsChar && rightIsChar;
  const bothIntOrChar =
    (leftIsChar || left.literal.nodeType === "int") &&
    (rightIsChar || right.literal.nodeType === "int");
  if (bothIntOrChar) {
    if (bothChar) {
      return charOperatorPlus(left, right);
    }

    return intOperatorPlus(coerceLiteralToInt(left), coerceLiteralToInt(right));
  }

  const leftIsString = left.literal.nodeType === "string";
  const rightIsString = right.literal.nodeType === "string";
  const bothCharOrString =
    (leftIsChar || leftIsString) && (rightIsChar || rightIsString);
  if (bothCharOrString) {
    return stringOperatorPlus(
      coerceLiteralToString(left),
      coerceLiteralToString(right)
    );
  }

  throw Error(
    `Runtime error: operator+: Cannot coerce ${left.literal.nodeType} and ${right.literal.nodeType} to the same type.`
  );
};

////////////////////////
// Operator -         //
////////////////////////

const intOperatorMinus = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  if (left.literal.nodeType !== "int" || right.literal.nodeType !== "int") {
    throw Error("Internal error: Unexpected literal node type.");
  }

  return {
    nodeType: "literal",
    literal: {
      nodeType: "int",
      int: (
        parseInt(left.literal.int) - parseInt(right.literal.int)
      ).toString(),
    },
  };
};

const doubleOperatorMinus = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  if (
    left.literal.nodeType !== "double" ||
    right.literal.nodeType !== "double"
  ) {
    throw Error("Internal error: Unexpected literal node type.");
  }

  return {
    nodeType: "literal",
    literal: {
      nodeType: "double",
      double: (
        parseFloat(left.literal.double) - parseFloat(right.literal.double)
      ).toString(),
    },
  };
};

const charOperatorMinus = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  if (left.literal.nodeType !== "char" || right.literal.nodeType !== "char") {
    throw Error("Internal error: Unexpected literal node type.");
  }

  return {
    nodeType: "literal",
    literal: {
      nodeType: "char",
      char: String.fromCharCode(
        left.literal.char.charCodeAt(0) - right.literal.char.charCodeAt(0)
      ),
    },
  };
};

const coerceOperatorMinus = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  const leftIsNumeric =
    left.literal.nodeType === "int" || left.literal.nodeType === "double";
  const rightIsNumeric =
    right.literal.nodeType === "int" || right.literal.nodeType === "double";
  const bothInt =
    left.literal.nodeType === "int" && right.literal.nodeType === "int";

  if (leftIsNumeric && rightIsNumeric) {
    if (bothInt) {
      return intOperatorMinus(left, right);
    }
    return doubleOperatorMinus(
      coerceLiteralToDouble(left),
      coerceLiteralToDouble(right)
    );
  }

  const leftIsChar = left.literal.nodeType === "char";
  const rightIsChar = right.literal.nodeType === "char";
  const bothChar = leftIsChar && rightIsChar;
  const bothIntOrChar =
    (leftIsChar || left.literal.nodeType === "int") &&
    (rightIsChar || right.literal.nodeType === "int");
  if (bothIntOrChar) {
    if (bothChar) {
      return charOperatorMinus(left, right);
    }
    return intOperatorMinus(
      coerceLiteralToInt(left),
      coerceLiteralToInt(right)
    );
  }

  if (
    left.literal.nodeType === "string" &&
    right.literal.nodeType === "string"
  ) {
    throw Error(`Runtime error: operator-: Invalid type string for operator -`);
  }

  throw Error(
    `Runtime error: operator-: Cannot coerce ${left.literal.nodeType} and ${right.literal.nodeType} to the same type.`
  );
};

////////////////////////
// Operator *         //
////////////////////////

const intOperatorMultiply = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  if (left.literal.nodeType !== "int" || right.literal.nodeType !== "int") {
    throw Error("Internal error: Unexpected literal node type.");
  }

  return {
    nodeType: "literal",
    literal: {
      nodeType: "int",
      int: (
        parseInt(left.literal.int) * parseInt(right.literal.int)
      ).toString(),
    },
  };
};

const doubleOperatorMultiply = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  if (
    left.literal.nodeType !== "double" ||
    right.literal.nodeType !== "double"
  ) {
    throw Error("Internal error: Unexpected literal node type.");
  }

  return {
    nodeType: "literal",
    literal: {
      nodeType: "double",
      double: (
        parseFloat(left.literal.double) * parseFloat(right.literal.double)
      ).toString(),
    },
  };
};

const charOperatorMultiply = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  if (left.literal.nodeType !== "char" || right.literal.nodeType !== "char") {
    throw Error("Internal error: Unexpected literal node type.");
  }

  return {
    nodeType: "literal",
    literal: {
      nodeType: "char",
      char: String.fromCharCode(
        left.literal.char.charCodeAt(0) * right.literal.char.charCodeAt(0)
      ),
    },
  };
};

const coerceOperatorMultiply = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  const leftIsNumeric =
    left.literal.nodeType === "int" || left.literal.nodeType === "double";
  const rightIsNumeric =
    right.literal.nodeType === "int" || right.literal.nodeType === "double";
  const bothInt =
    left.literal.nodeType === "int" && right.literal.nodeType === "int";

  if (leftIsNumeric && rightIsNumeric) {
    if (bothInt) {
      return intOperatorMultiply(left, right);
    }
    return doubleOperatorMultiply(
      coerceLiteralToDouble(left),
      coerceLiteralToDouble(right)
    );
  }

  const leftIsChar = left.literal.nodeType === "char";
  const rightIsChar = right.literal.nodeType === "char";
  const bothChar = leftIsChar && rightIsChar;
  const bothIntOrChar =
    (leftIsChar || left.literal.nodeType === "int") &&
    (rightIsChar || right.literal.nodeType === "int");
  if (bothIntOrChar) {
    if (bothChar) {
      return charOperatorMultiply(left, right);
    }
    return intOperatorMultiply(
      coerceLiteralToInt(left),
      coerceLiteralToInt(right)
    );
  }

  throw Error(
    `Runtime error: operator*: Cannot coerce ${left.literal.nodeType} and ${right.literal.nodeType} to the same type.`
  );
};

////////////////////////
// Operator /         //
////////////////////////

const intOperatorDivide = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  if (left.literal.nodeType !== "int" || right.literal.nodeType !== "int") {
    throw Error("Internal error: Unexpected literal node type.");
  }

  return {
    nodeType: "literal",
    literal: {
      nodeType: "int",
      int: Math.floor(
        parseInt(left.literal.int) / parseInt(right.literal.int)
      ).toString(),
    },
  };
};

const doubleOperatorDivide = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  if (
    left.literal.nodeType !== "double" ||
    right.literal.nodeType !== "double"
  ) {
    throw Error("Internal error: Unexpected literal node type.");
  }

  return {
    nodeType: "literal",
    literal: {
      nodeType: "double",
      double: (
        parseFloat(left.literal.double) / parseFloat(right.literal.double)
      ).toString(),
    },
  };
};

const charOperatorDivide = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  if (left.literal.nodeType !== "char" || right.literal.nodeType !== "char") {
    throw Error("Internal error: Unexpected literal node type.");
  }

  return {
    nodeType: "literal",
    literal: {
      nodeType: "char",
      char: String.fromCharCode(
        Math.floor(
          left.literal.char.charCodeAt(0) / right.literal.char.charCodeAt(0)
        )
      ),
    },
  };
};

const coerceOperatorDivide = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  const leftIsNumeric =
    left.literal.nodeType === "int" || left.literal.nodeType === "double";
  const rightIsNumeric =
    right.literal.nodeType === "int" || right.literal.nodeType === "double";
  const bothInt =
    left.literal.nodeType === "int" && right.literal.nodeType === "int";

  if (leftIsNumeric && rightIsNumeric) {
    if (bothInt) {
      return intOperatorDivide(left, right);
    }
    return doubleOperatorDivide(
      coerceLiteralToDouble(left),
      coerceLiteralToDouble(right)
    );
  }

  const leftIsChar = left.literal.nodeType === "char";
  const rightIsChar = right.literal.nodeType === "char";
  const bothChar = leftIsChar && rightIsChar;
  const bothIntOrChar =
    (leftIsChar || left.literal.nodeType === "int") &&
    (rightIsChar || right.literal.nodeType === "int");
  if (bothIntOrChar) {
    if (bothChar) {
      return charOperatorDivide(left, right);
    }
    return intOperatorDivide(
      coerceLiteralToInt(left),
      coerceLiteralToInt(right)
    );
  }

  throw Error(
    `Runtime error: operator/: Cannot coerce ${left.literal.nodeType} and ${right.literal.nodeType} to the same type.`
  );
};

export {
  coerceOperatorPlus,
  coerceOperatorMinus,
  coerceOperatorMultiply,
  coerceOperatorDivide,
};
