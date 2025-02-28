import { LiteralNode } from "../grammar_output_validator";
import {
  coerceLiteralToDouble,
  coerceLiteralToInt,
  coerceLiteralToString,
} from "./coerce";

////////////////////////
// Operator +         //
////////////////////////

const uint32_tOperatorPlus = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  if (
    left.literal.nodeType !== "uint32_t" ||
    right.literal.nodeType !== "uint32_t"
  ) {
    throw Error("Internal error: Unexpected literal node type.");
  }

  return {
    nodeType: "literal",
    literal: {
      nodeType: "uint32_t",
      value: left.literal.value + right.literal.value,
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
      value: left.literal.value + right.literal.value,
    },
  };
};

const uint8_tOperatorPlus = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  if (
    left.literal.nodeType !== "uint8_t" ||
    right.literal.nodeType !== "uint8_t"
  ) {
    throw Error("Internal error: Unexpected literal node type.");
  }

  return {
    nodeType: "literal",
    literal: {
      nodeType: "uint8_t",
      value: (left.literal.value + right.literal.value) & 0xff,
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
      value: left.literal.value + right.literal.value,
    },
  };
};

const coerceOperatorPlus = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  const leftIsNumeric =
    left.literal.nodeType === "uint32_t" || left.literal.nodeType === "double";
  const rightIsNumeric =
    right.literal.nodeType === "uint32_t" ||
    right.literal.nodeType === "double";
  const bothInt =
    left.literal.nodeType === "uint32_t" &&
    right.literal.nodeType === "uint32_t";

  if (leftIsNumeric && rightIsNumeric) {
    if (bothInt) {
      return uint32_tOperatorPlus(left, right);
    } else {
      return doubleOperatorPlus(
        coerceLiteralToDouble(left),
        coerceLiteralToDouble(right)
      );
    }
  }

  const leftIsChar = left.literal.nodeType === "uint8_t";
  const rightIsChar = right.literal.nodeType === "uint8_t";
  const bothChar = leftIsChar && rightIsChar;
  const bothIntOrChar =
    (leftIsChar || left.literal.nodeType === "uint32_t") &&
    (rightIsChar || right.literal.nodeType === "uint32_t");
  if (bothIntOrChar) {
    if (bothChar) {
      return uint8_tOperatorPlus(left, right);
    }

    return uint32_tOperatorPlus(
      coerceLiteralToInt(left),
      coerceLiteralToInt(right)
    );
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

const uint32_tOperatorMinus = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  if (
    left.literal.nodeType !== "uint32_t" ||
    right.literal.nodeType !== "uint32_t"
  ) {
    throw Error("Internal error: Unexpected literal node type.");
  }

  return {
    nodeType: "literal",
    literal: {
      nodeType: "uint32_t",
      value: left.literal.value - right.literal.value,
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
      value: left.literal.value - right.literal.value,
    },
  };
};

const uint8_tOperatorMinus = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  if (
    left.literal.nodeType !== "uint8_t" ||
    right.literal.nodeType !== "uint8_t"
  ) {
    throw Error("Internal error: Unexpected literal node type.");
  }

  return {
    nodeType: "literal",
    literal: {
      nodeType: "uint8_t",
      value: (left.literal.value - right.literal.value) & 0xff,
    },
  };
};

const coerceOperatorMinus = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  const leftIsNumeric =
    left.literal.nodeType === "uint32_t" || left.literal.nodeType === "double";
  const rightIsNumeric =
    right.literal.nodeType === "uint32_t" ||
    right.literal.nodeType === "double";
  const bothInt =
    left.literal.nodeType === "uint32_t" &&
    right.literal.nodeType === "uint32_t";

  if (leftIsNumeric && rightIsNumeric) {
    if (bothInt) {
      return uint32_tOperatorMinus(left, right);
    }
    return doubleOperatorMinus(
      coerceLiteralToDouble(left),
      coerceLiteralToDouble(right)
    );
  }

  const leftIsChar = left.literal.nodeType === "uint8_t";
  const rightIsChar = right.literal.nodeType === "uint8_t";
  const bothChar = leftIsChar && rightIsChar;
  const bothIntOrChar =
    (leftIsChar || left.literal.nodeType === "uint32_t") &&
    (rightIsChar || right.literal.nodeType === "uint32_t");
  if (bothIntOrChar) {
    if (bothChar) {
      return uint8_tOperatorMinus(left, right);
    }
    return uint32_tOperatorMinus(
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

const uint32_tOperatorMultiply = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  if (
    left.literal.nodeType !== "uint32_t" ||
    right.literal.nodeType !== "uint32_t"
  ) {
    throw Error("Internal error: Unexpected literal node type.");
  }

  return {
    nodeType: "literal",
    literal: {
      nodeType: "uint32_t",
      value: left.literal.value * right.literal.value,
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
      value: left.literal.value * right.literal.value,
    },
  };
};

const uint8_tOperatorMultiply = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  if (
    left.literal.nodeType !== "uint8_t" ||
    right.literal.nodeType !== "uint8_t"
  ) {
    throw Error("Internal error: Unexpected literal node type.");
  }

  return {
    nodeType: "literal",
    literal: {
      nodeType: "uint8_t",
      value: (left.literal.value * right.literal.value) & 0xff,
    },
  };
};

const coerceOperatorMultiply = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  const leftIsNumeric =
    left.literal.nodeType === "uint32_t" || left.literal.nodeType === "double";
  const rightIsNumeric =
    right.literal.nodeType === "uint32_t" ||
    right.literal.nodeType === "double";
  const bothInt =
    left.literal.nodeType === "uint32_t" &&
    right.literal.nodeType === "uint32_t";

  if (leftIsNumeric && rightIsNumeric) {
    if (bothInt) {
      return uint32_tOperatorMultiply(left, right);
    }
    return doubleOperatorMultiply(
      coerceLiteralToDouble(left),
      coerceLiteralToDouble(right)
    );
  }

  const leftIsChar = left.literal.nodeType === "uint8_t";
  const rightIsChar = right.literal.nodeType === "uint8_t";
  const bothChar = leftIsChar && rightIsChar;
  const bothIntOrChar =
    (leftIsChar || left.literal.nodeType === "uint32_t") &&
    (rightIsChar || right.literal.nodeType === "uint32_t");
  if (bothIntOrChar) {
    if (bothChar) {
      return uint8_tOperatorMultiply(left, right);
    }
    return uint32_tOperatorMultiply(
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

const uint32_tOperatorDivide = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  if (
    left.literal.nodeType !== "uint32_t" ||
    right.literal.nodeType !== "uint32_t"
  ) {
    throw Error("Internal error: Unexpected literal node type.");
  }

  return {
    nodeType: "literal",
    literal: {
      nodeType: "uint32_t",
      value: Math.floor(left.literal.value / right.literal.value),
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
      value: left.literal.value / right.literal.value,
    },
  };
};

const uint8_tOperatorDivide = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  if (
    left.literal.nodeType !== "uint8_t" ||
    right.literal.nodeType !== "uint8_t"
  ) {
    throw Error("Internal error: Unexpected literal node type.");
  }

  return {
    nodeType: "literal",
    literal: {
      nodeType: "uint8_t",
      value: Math.floor(left.literal.value / right.literal.value) & 0xff,
    },
  };
};

const coerceOperatorDivide = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  const leftIsNumeric =
    left.literal.nodeType === "uint32_t" || left.literal.nodeType === "double";
  const rightIsNumeric =
    right.literal.nodeType === "uint32_t" ||
    right.literal.nodeType === "double";
  const bothInt =
    left.literal.nodeType === "uint32_t" &&
    right.literal.nodeType === "uint32_t";

  if (leftIsNumeric && rightIsNumeric) {
    if (bothInt) {
      return uint32_tOperatorDivide(left, right);
    }
    return doubleOperatorDivide(
      coerceLiteralToDouble(left),
      coerceLiteralToDouble(right)
    );
  }

  const leftIsChar = left.literal.nodeType === "uint8_t";
  const rightIsChar = right.literal.nodeType === "uint8_t";
  const bothChar = leftIsChar && rightIsChar;
  const bothIntOrChar =
    (leftIsChar || left.literal.nodeType === "uint32_t") &&
    (rightIsChar || right.literal.nodeType === "uint32_t");
  if (bothIntOrChar) {
    if (bothChar) {
      return uint8_tOperatorDivide(left, right);
    }
    return uint32_tOperatorDivide(
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
