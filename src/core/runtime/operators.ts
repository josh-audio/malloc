import { LiteralNode } from "../grammar_output_validator";
import {
  coerceLiteralToDouble,
  coerceLiteralToU64,
  coerceLiteralToString,
} from "./coerce";

////////////////////////
// Operator +         //
////////////////////////

const integerOperatorPlus = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  if (
    left.literal.nodeType !== "integer" ||
    right.literal.nodeType !== "integer"
  ) {
    throw Error("Internal error: Unexpected literal node type.");
  }

  return {
    nodeType: "literal",
    literal: {
      nodeType: "integer",
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
    left.literal.nodeType === "integer" || left.literal.nodeType === "double";
  const rightIsNumeric =
    right.literal.nodeType === "integer" || right.literal.nodeType === "double";
  const bothInt =
    left.literal.nodeType === "integer" && right.literal.nodeType === "integer";

  if (leftIsNumeric && rightIsNumeric) {
    if (bothInt) {
      return integerOperatorPlus(left, right);
    } else {
      return doubleOperatorPlus(
        coerceLiteralToDouble(left),
        coerceLiteralToDouble(right)
      );
    }
  }

  const leftIsString = left.literal.nodeType === "string";
  const rightIsString = right.literal.nodeType === "string";
  if (leftIsString && rightIsString) {
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

const integerOperatorMinus = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  if (
    left.literal.nodeType !== "integer" ||
    right.literal.nodeType !== "integer"
  ) {
    throw Error("Internal error: Unexpected literal node type.");
  }

  return {
    nodeType: "literal",
    literal: {
      nodeType: "integer",
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

const coerceOperatorMinus = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  const leftIsNumeric =
    left.literal.nodeType === "integer" || left.literal.nodeType === "double";
  const rightIsNumeric =
    right.literal.nodeType === "integer" || right.literal.nodeType === "double";
  const bothInt =
    left.literal.nodeType === "integer" && right.literal.nodeType === "integer";

  if (leftIsNumeric && rightIsNumeric) {
    if (bothInt) {
      return integerOperatorMinus(left, right);
    }
    return doubleOperatorMinus(
      coerceLiteralToDouble(left),
      coerceLiteralToDouble(right)
    );
  }

  if (bothInt) {
    return integerOperatorMinus(
      coerceLiteralToU64(left),
      coerceLiteralToU64(right)
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

const integerOperatorMultiply = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  if (
    left.literal.nodeType !== "integer" ||
    right.literal.nodeType !== "integer"
  ) {
    throw Error("Internal error: Unexpected literal node type.");
  }

  return {
    nodeType: "literal",
    literal: {
      nodeType: "integer",
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

const coerceOperatorMultiply = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  const leftIsNumeric =
    left.literal.nodeType === "integer" || left.literal.nodeType === "double";
  const rightIsNumeric =
    right.literal.nodeType === "integer" || right.literal.nodeType === "double";
  const bothInt =
    left.literal.nodeType === "integer" && right.literal.nodeType === "integer";

  if (leftIsNumeric && rightIsNumeric) {
    if (bothInt) {
      return integerOperatorMultiply(left, right);
    }
    return doubleOperatorMultiply(
      coerceLiteralToDouble(left),
      coerceLiteralToDouble(right)
    );
  }

  if (bothInt) {
    return integerOperatorMultiply(
      coerceLiteralToU64(left),
      coerceLiteralToU64(right)
    );
  }

  throw Error(
    `Runtime error: operator*: Cannot coerce ${left.literal.nodeType} and ${right.literal.nodeType} to the same type.`
  );
};

////////////////////////
// Operator /         //
////////////////////////

const integerOperatorDivide = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  if (
    left.literal.nodeType !== "integer" ||
    right.literal.nodeType !== "integer"
  ) {
    throw Error("Internal error: Unexpected literal node type.");
  }

  return {
    nodeType: "literal",
    literal: {
      nodeType: "integer",
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

const coerceOperatorDivide = (
  left: LiteralNode,
  right: LiteralNode
): LiteralNode => {
  const leftIsNumeric =
    left.literal.nodeType === "integer" || left.literal.nodeType === "double";
  const rightIsNumeric =
    right.literal.nodeType === "integer" || right.literal.nodeType === "double";
  const bothInt =
    left.literal.nodeType === "integer" && right.literal.nodeType === "integer";

  if (leftIsNumeric && rightIsNumeric) {
    if (bothInt) {
      return integerOperatorDivide(left, right);
    }
    return doubleOperatorDivide(
      coerceLiteralToDouble(left),
      coerceLiteralToDouble(right)
    );
  }

  if (bothInt) {
    return integerOperatorDivide(
      coerceLiteralToU64(left),
      coerceLiteralToU64(right)
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
