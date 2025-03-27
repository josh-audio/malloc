import { LiteralNode, TypeNode } from "../grammar_output_validator";
import { UntypedRuntimeValueNode, TypedRuntimeValueNode } from "./engine";

const coerceLiteralToDouble = (value: LiteralNode): LiteralNode => {
  if (value.literal.nodeType === "double") {
    return value;
  } else if (value.literal.nodeType === "integer") {
    return {
      nodeType: "literal",
      literal: {
        nodeType: "double",
        value: value.literal.value,
      },
    };
  } else {
    throw Error(
      `Runtime error: Cannot coerce ${value.literal.nodeType} to double.`
    );
  }
};

const coerceLiteralToU8 = (value: LiteralNode): LiteralNode => {
  return coerceLiteralToInt(value, "uint8_t");
};

const coerceLiteralToU16 = (value: LiteralNode): LiteralNode => {
  return coerceLiteralToInt(value, "uint16_t");
};

const coerceLiteralToU32 = (value: LiteralNode): LiteralNode => {
  return coerceLiteralToInt(value, "uint32_t");
};

const coerceLiteralToU64 = (value: LiteralNode): LiteralNode => {
  return coerceLiteralToInt(value, "uint64_t");
};

const coerceLiteralToInt = (
  value: LiteralNode,
  intType: "uint8_t" | "uint16_t" | "uint32_t" | "uint64_t"
): LiteralNode => {
  let mask = null;
  if (intType === "uint8_t") {
    mask = 0xff;
  } else if (intType === "uint16_t") {
    mask = 0xffff;
  } else if (intType === "uint32_t") {
    mask = 0xffffffff;
  }

  if (value.literal.nodeType === "integer") {
    return {
      nodeType: "literal",
      literal: {
        nodeType: "integer",
        value: mask === null ? value.literal.value : value.literal.value & mask,
      },
    };
  } else if (value.literal.nodeType === "double") {
    return {
      nodeType: "literal",
      literal: {
        nodeType: "integer",
        value:
          mask === null
            ? Math.floor(value.literal.value)
            : Math.floor(value.literal.value) & mask,
      },
    };
  } else {
    throw Error(
      `Runtime error: Cannot coerce ${value.literal.nodeType} to uint16_t.`
    );
  }
};

const coerceLiteralToString = (value: LiteralNode): LiteralNode => {
  if (value.literal.nodeType === "string") {
    return value;
  } else {
    throw Error(
      `Runtime error: Cannot coerce ${value.literal.nodeType} to string.`
    );
  }
};

const coerce = (
  value: UntypedRuntimeValueNode,
  type: TypeNode
): TypedRuntimeValueNode => {
  if (value.value.nodeType !== "literal") {
    throw Error(
      `Internal error: coerce: Unexpected value node with type: "${value.value.nodeType}".`
    );
  }

  if (type.type === "uint64_t") {
    return {
      nodeType: "typedRuntimeValue",
      type: type,
      value: coerceLiteralToU64(value.value),
    };
  } else if (type.type === "uint32_t") {
    return {
      nodeType: "typedRuntimeValue",
      type: type,
      value: coerceLiteralToU32(value.value),
    };
  } else if (type.type === "uint16_t") {
    return {
      nodeType: "typedRuntimeValue",
      type: type,
      value: coerceLiteralToU16(value.value),
    };
  } else if (type.type === "uint8_t" || type.isPointer) {
    return {
      nodeType: "typedRuntimeValue",
      type: type,
      value: coerceLiteralToU8(value.value),
    };
  } else if (type.type === "double") {
    return {
      nodeType: "typedRuntimeValue",
      type: type,
      value: coerceLiteralToDouble(value.value),
    };
  } else if (type.type === "string") {
    return {
      nodeType: "typedRuntimeValue",
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
  coerceLiteralToU64,
  coerceLiteralToU32,
  coerceLiteralToU16,
  coerceLiteralToDouble,
  coerceLiteralToU8,
  coerceLiteralToString,
  coerce,
};
