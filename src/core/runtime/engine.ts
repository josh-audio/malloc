import state from "../../state/state";
import {
  DeclarationNode,
  LiteralNode,
  StatementNode,
  TypeNode,
} from "../grammar_output_validator";
import { coerce, coerceLiteralToU8 } from "./coerce";
import {
  BEST_FIT,
  FIRST_FIT,
  freeImpl,
  getFreeList,
  initMemory,
  mallocImpl,
  NEXT_FIT,
  WORST_FIT,
} from "./malloc_impl";
import {
  bytesToNum,
  bytesToNumFloat,
  numToBytes,
  numToBytesFloat,
} from "./num_convert";
import {
  coerceOperatorDivide,
  coerceOperatorMinus,
  coerceOperatorMultiply,
  coerceOperatorPlus,
} from "./operators";

type VoidNode = {
  nodeType: "void";
};

// Defines a function that is implemented in native JavaScript.
type NativeFunctionDefinitionNode = {
  nodeType: "nativeFunctionDefinition";

  // Union with type node here is a hack. If we want types to be passed into
  // functions, we really should allow types as values in the grammar, and then
  // have the runtime engine handle them. For now we just allow types as values
  // in function calls from the grammar side, and nowhere else except casts and
  // declarations.
  arguments: (DeclarationNode | TypeNode)[];
  body: (
    args: (UntypedRuntimeValueNode | TypedRuntimeValueNode | TypeNode)[]
  ) => UntypedRuntimeValueNode | TypedRuntimeValueNode | VoidNode;
};

// Represents a raw runtime value. All integer types are just "integer" here.
type UntypedRuntimeValueNode = {
  nodeType: "untypedRuntimeValue";
  value: LiteralNode | NativeFunctionDefinitionNode;
};

// Represents a runtime value with a concrete type. This is currently just used
// to disambiguate integer types.
type TypedRuntimeValueNode = {
  nodeType: "typedRuntimeValue";
  type: TypeNode;
  value: LiteralNode | NativeFunctionDefinitionNode;
};

type Scope = Record<string, TypedRuntimeValueNode>;

class Engine {
  globalScope: Scope = {
    malloc: {
      nodeType: "typedRuntimeValue",
      type: {
        nodeType: "type",
        type: "nativeFunction",
        isPointer: false,
      },
      value: {
        nodeType: "nativeFunctionDefinition",
        arguments: [
          {
            nodeType: "declaration",
            declaration: {
              nodeType: "singleDeclaration",
              identifier: {
                nodeType: "identifier",
                identifier: "size",
              },
              type: {
                nodeType: "type",
                type: "uint32_t",
                isPointer: false,
              },
            },
          },
        ],
        body: (
          args: (UntypedRuntimeValueNode | TypedRuntimeValueNode | TypeNode)[]
        ) => {
          if (args.some((arg) => arg.nodeType === "type")) {
            throw new Error(`Runtime error: Cannot call malloc with a type`);
          }

          return mallocImpl(
            args.filter((arg) => arg.nodeType === "untypedRuntimeValue")
          );
        },
      },
    },

    free: {
      nodeType: "typedRuntimeValue",
      type: {
        nodeType: "type",
        type: "nativeFunction",
        isPointer: false,
      },
      value: {
        nodeType: "nativeFunctionDefinition",
        arguments: [
          {
            nodeType: "declaration",
            declaration: {
              nodeType: "singleDeclaration",
              identifier: {
                nodeType: "identifier",
                identifier: "address",
              },
              type: {
                nodeType: "type",
                type: "void",
                isPointer: true,
              },
            },
          },
        ],
        body: (args) => {
          if (args.some((arg) => arg.nodeType === "type")) {
            throw new Error(`Runtime error: Cannot call free with a type`);
          }

          return freeImpl(
            args.filter(
              (arg) =>
                arg.nodeType === "untypedRuntimeValue" ||
                arg.nodeType === "typedRuntimeValue"
            )
          );
        },
      },
    },

    clear: {
      nodeType: "typedRuntimeValue",
      type: {
        nodeType: "type",
        type: "nativeFunction",
        isPointer: false,
      },
      value: {
        nodeType: "nativeFunctionDefinition",
        arguments: [],
        body: () => {
          state.commandHistory = [];
          return { nodeType: "void" };
        },
      },
    },

    setDisplayBase: {
      nodeType: "typedRuntimeValue",
      type: {
        nodeType: "type",
        type: "nativeFunction",
        isPointer: false,
      },
      value: {
        nodeType: "nativeFunctionDefinition",
        arguments: [
          {
            nodeType: "declaration",
            declaration: {
              nodeType: "singleDeclaration",
              identifier: {
                nodeType: "identifier",
                identifier: "base",
              },
              type: {
                nodeType: "type",
                type: "uint32_t",
                isPointer: false,
              },
            },
          },
        ],
        body: (
          args: (UntypedRuntimeValueNode | TypedRuntimeValueNode | TypeNode)[]
        ) => {
          if (args[0].nodeType === "type") {
            throw new Error(
              `Runtime error: Cannot call setDisplayBase with a type`
            );
          }

          if (args[0].value.nodeType !== "literal") {
            throw new Error(
              `Runtime error: Expected argument 0 to be of type int, but got ${args[0].value.nodeType}.`
            );
          }

          if (args[0].value.literal.nodeType !== "integer") {
            throw new Error(
              `Internal error: Expected argument 0 to be of type int, but got ${args[0].value.literal.nodeType}.`
            );
          }

          const base = args[0].value.literal.value;

          if (base !== 10 && base !== 16) {
            throw new Error(
              `Runtime error: Invalid base ${base}. Must be 10 or 16.`
            );
          }

          state.displayBase = base;

          return { nodeType: "void" };
        },
      },
    },

    sizeof: {
      nodeType: "typedRuntimeValue",
      type: {
        nodeType: "type",
        type: "nativeFunction",
        isPointer: false,
      },
      value: {
        nodeType: "nativeFunctionDefinition",
        arguments: [
          {
            nodeType: "type",
            type: "void", // Again, a hack. This doesn't actually matter, just a placeholder.
            isPointer: false,
          },
        ],
        body: (
          args: (UntypedRuntimeValueNode | TypedRuntimeValueNode | TypeNode)[]
        ) => {
          if (args.length !== 1) {
            throw new Error(
              `Runtime error: Expected 1 argument for sizeof, but got ${args.length}.`
            );
          }

          if (args[0].nodeType !== "type") {
            throw new Error(
              `Internal error: Expected argument 0 to be of type "type", but got ${args[0].nodeType}.`
            );
          }

          if (args[0].type === "void") {
            throw new Error(
              `Runtime error: Cannot call sizeof on type "void".`
            );
          }

          if (args[0].type === "string") {
            throw new Error(
              `Runtime error: Cannot call sizeof on type "string".`
            );
          }

          let size = 1;

          if (args[0].type === "uint32_t") {
            size = 4;
          }

          const returnValue: UntypedRuntimeValueNode = {
            nodeType: "untypedRuntimeValue",
            value: {
              nodeType: "literal",
              literal: {
                nodeType: "integer",
                value: size,
              },
            },
          };

          return returnValue;
        },
      },
    },

    reset: {
      nodeType: "typedRuntimeValue",
      type: {
        nodeType: "type",
        type: "nativeFunction",
        isPointer: false,
      },
      value: {
        nodeType: "nativeFunctionDefinition",
        arguments: [],
        body: () => {
          initMemory();
          return { nodeType: "void" };
        },
      },
    },

    // __debug: {
    //   nodeType: "typedRuntimeValue",
    //   type: {
    //     nodeType: "type",
    //     type: "nativeFunction",
    //     isPointer: false,
    //   },
    //   value: {
    //     nodeType: "nativeFunctionDefinition",
    //     arguments: [],
    //     body: () => {
    //       console.log(state.heap);

    //       state.heap = [
    //         0, 3, 0, 21, 38, 0, 0, 0, 0, 0, 7, 171, 0, 0, 0, 0, 0, 7, 38, 0, 0,
    //         0, 0, 0, 7, 171, 0, 0, 0, 0, 0, 7, 171, 0, 0, 0, 0, 0, 218, 0, 0, 0,
    //         0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    //         0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    //         0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    //         0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    //         0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    //         0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    //         0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    //         0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    //         0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    //         0, 0, 0, 0, 0, 0, 0,
    //       ];
    //       return { nodeType: "void" };
    //     },
    //   },
    // },

    FIRST_FIT: {
      nodeType: "typedRuntimeValue",
      type: {
        nodeType: "type",
        type: "uint8_t",
        isPointer: false,
      },
      value: {
        nodeType: "literal",
        literal: {
          nodeType: "integer",
          value: FIRST_FIT,
        },
      },
    },

    NEXT_FIT: {
      nodeType: "typedRuntimeValue",
      type: {
        nodeType: "type",
        type: "uint8_t",
        isPointer: false,
      },
      value: {
        nodeType: "literal",
        literal: {
          nodeType: "integer",
          value: NEXT_FIT,
        },
      },
    },

    BEST_FIT: {
      nodeType: "typedRuntimeValue",
      type: {
        nodeType: "type",
        type: "uint8_t",
        isPointer: false,
      },
      value: {
        nodeType: "literal",
        literal: {
          nodeType: "integer",
          value: BEST_FIT,
        },
      },
    },

    WORST_FIT: {
      nodeType: "typedRuntimeValue",
      type: {
        nodeType: "type",
        type: "uint8_t",
        isPointer: false,
      },
      value: {
        nodeType: "literal",
        literal: {
          nodeType: "integer",
          value: WORST_FIT,
        },
      },
    },

    setStrategy: {
      nodeType: "typedRuntimeValue",
      type: {
        nodeType: "type",
        type: "nativeFunction",
        isPointer: false,
      },
      value: {
        nodeType: "nativeFunctionDefinition",
        arguments: [
          {
            nodeType: "declaration",
            declaration: {
              nodeType: "singleDeclaration",
              identifier: {
                nodeType: "identifier",
                identifier: "strategy",
              },
              type: {
                nodeType: "type",
                type: "uint32_t",
                isPointer: false,
              },
            },
          },
        ],
        body: (
          args: (UntypedRuntimeValueNode | TypedRuntimeValueNode | TypeNode)[]
        ) => {
          if (args[0].nodeType === "type") {
            throw new Error(
              `Runtime error: Cannot call setMemoryAllocationStrategy with a type`
            );
          }

          if (args[0].value.nodeType !== "literal") {
            throw new Error(
              `Runtime error: Expected argument 0 to be of type int, but got ${args[0].value.nodeType}.`
            );
          }

          if (args[0].value.literal.nodeType !== "integer") {
            throw new Error(
              `Internal error: Expected argument 0 to be of type int, but got ${args[0].value.literal.nodeType}.`
            );
          }

          const strategy = args[0].value.literal.value;

          if (
            strategy !== FIRST_FIT &&
            strategy !== NEXT_FIT &&
            strategy !== BEST_FIT &&
            strategy !== WORST_FIT
          ) {
            throw new Error(
              `Runtime error: Invalid memory allocation strategy ${strategy}. Must be one of FIRST_FIT, NEXT_FIT, BEST_FIT, or WORST_FIT.`
            );
          }

          state.memoryAllocationStrategy = strategy;

          // Set the next fit pointer to the beginning of the free list if needed
          if (strategy === NEXT_FIT) {
            // If the next fit pointer is not in the free list, set it to the
            // first block so it's not invalid.
            const freeList = getFreeList();
            if (!freeList.find((block) => block.startIndex === state.heap[2])) {
              state.heap[2] = state.heap[1];
            }
          }

          return { nodeType: "void" };
        },
      },
    },
  };

  // Recursively evaluates the given statement. Returns a literal node if the
  // statement evaluates to a value, otherwise returns a void node.
  evaluate(
    statement: StatementNode
  ): UntypedRuntimeValueNode | TypedRuntimeValueNode | VoidNode {
    if (statement.nodeType === "literal") {
      return {
        nodeType: "untypedRuntimeValue",
        value: statement,
      };
    } else if (statement.nodeType === "operator") {
      const left = this.evaluate(statement.left);
      const right = this.evaluate(statement.right);

      if (left.nodeType === "void") {
        throw new Error(
          `Runtime error: Left-hand side of operator ${statement.operator} is void.`
        );
      } else if (right.nodeType === "void") {
        throw new Error(
          `Runtime error: Right-hand side of operator ${statement.operator} is void.`
        );
      }

      if (left.value.nodeType !== "literal") {
        throw new Error(
          `Runtime error: Expected left value to be of type "literal", but got ${left.value.nodeType}.`
        );
      } else if (right.value.nodeType !== "literal") {
        throw new Error(
          `Runtime error: Expected right value to be of type "literal", but got ${right.value.nodeType}.`
        );
      }

      let literal: LiteralNode;

      if (statement.operator === "+") {
        literal = coerceOperatorPlus(left.value, right.value);
      } else if (statement.operator === "-") {
        literal = coerceOperatorMinus(left.value, right.value);
      } else if (statement.operator === "*") {
        literal = coerceOperatorMultiply(left.value, right.value);
      } else if (statement.operator === "/") {
        literal = coerceOperatorDivide(left.value, right.value);
      } else {
        throw Error(
          `Internal error: Unexpected operator ${statement.operator}.`
        );
      }

      return {
        nodeType: "untypedRuntimeValue",
        value: literal,
      };
    } else if (statement.nodeType === "cast") {
      const result = this.evaluate(statement.statement);

      if (result.nodeType === "void") {
        throw new Error(
          `Runtime error: Type "void" cannot be cast to ${statement.type.type}.`
        );
      }

      return coerce(
        {
          nodeType: "untypedRuntimeValue",
          value: result.value,
        },
        statement.type
      );
    } else if (statement.nodeType == "parenthesis") {
      return this.evaluate(statement.statement);
    } else if (statement.nodeType === "declaration") {
      const type = statement.declaration.type.type;

      if (type === "void") {
        throw new Error('Type error: Cannot declare variable of type "void".');
      }

      if (statement.declaration.type.type === "string") {
        this.globalScope[statement.declaration.identifier.identifier] = {
          nodeType: "typedRuntimeValue",
          type: statement.declaration.type,
          value: {
            nodeType: "literal",
            literal: {
              nodeType: "string",
              value: "",
            },
          },
        };
      } else {
        this.globalScope[statement.declaration.identifier.identifier] = coerce(
          {
            nodeType: "untypedRuntimeValue",
            value: {
              nodeType: "literal",
              literal: {
                nodeType: "integer",
                value: 0,
              },
            },
          },
          statement.declaration.type
        );
      }

      return { nodeType: "void" };
    } else if (statement.nodeType === "identifier") {
      const value = this.globalScope[statement.identifier];

      if (value === undefined) {
        throw new Error(
          `Runtime error: Identifier "${statement.identifier}" is not defined.`
        );
      }

      return value;
    } else if (statement.nodeType === "assignment") {
      let memWriteInfo:
        | {
            type: "integer";
            address: number;
            bits: 8 | 16 | 32 | 64;
            signed: boolean;
          }
        | { type: "float"; address: number; double: boolean }
        | undefined;

      if (statement.left.nodeType === "declaration") {
        // If the left side is a declaration, evaluate it first
        this.evaluate(statement.left);
      } else if (statement.left.nodeType === "dereference") {
        const runtimeValue = this.evaluate(statement.left.statement);

        if (runtimeValue.nodeType === "void") {
          throw new Error(`Runtime error: Cannot dereference void value.`);
        }

        if (runtimeValue.nodeType === "untypedRuntimeValue") {
          throw new Error(`Cannot dereference literal value.`);
        }

        // If the left side is a dereference, store the memory address for later
        const address = this.getDereferenceAddress(runtimeValue);

        if (address < 0 || address >= state.heap.length) {
          throw new Error(
            `Runtime error: Address ${address} is outside of the addressable memory range.`
          );
        }

        const type = runtimeValue.type.type;

        if (type === "uint8_t" || type === "int8_t") {
          memWriteInfo = {
            type: "integer",
            address,
            bits: 8,
            signed: !type.startsWith("u"),
          };
        } else if (type === "uint16_t" || type === "int16_t") {
          memWriteInfo = {
            type: "integer",
            address,
            bits: 16,
            signed: !type.startsWith("u"),
          };
        } else if (type === "uint32_t" || type === "int32_t") {
          memWriteInfo = {
            type: "integer",
            address,
            bits: 32,
            signed: !type.startsWith("u"),
          };
        } else if (type === "uint64_t" || type === "int64_t") {
          memWriteInfo = {
            type: "integer",
            address,
            bits: 64,
            signed: !type.startsWith("u"),
          };
        } else if (type === "float" || type === "double") {
          memWriteInfo = {
            type: "float",
            address,
            double: type === "double",
          };
        } else {
          throw new Error(
            `Internal error: Unexpected pointer type ${runtimeValue.type.type}.`
          );
        }
      } else if (statement.left.nodeType === "arrayAccess") {
        const pointerStart = this.evaluate(statement.left.identifier);

        if (pointerStart.nodeType === "void") {
          throw new Error(`Runtime error: Cannot dereference void value.`);
        }

        if (pointerStart.nodeType === "untypedRuntimeValue") {
          throw new Error(`Runtime error: Cannot dereference literal value.`);
        }

        if (pointerStart.value.nodeType !== "literal") {
          throw new Error(
            `Internal error: Expected pointer start to be of type "literal", but got ${pointerStart.value.nodeType}.`
          );
        }

        const pointerStartValue = pointerStart.value.literal.value;

        if (typeof pointerStartValue !== "number") {
          throw new Error(
            `Internal error: Expected pointer start value to be a number, but got ${typeof pointerStartValue}.`
          );
        }

        const pointerOffset = this.evaluate(statement.left.value);

        if (pointerOffset.nodeType === "void") {
          throw new Error(`Runtime error: Cannot dereference void value.`);
        }

        if (pointerOffset.value.nodeType !== "literal") {
          throw new Error(
            `Internal error: Expected pointer offset to be of type "literal", but got ${pointerOffset.value.nodeType}.`
          );
        }

        const pointerOffsetValue = pointerOffset.value.literal.value;

        if (typeof pointerOffsetValue !== "number") {
          throw new Error(
            `Internal error: Expected pointer offset value to be a number, but got ${typeof pointerOffsetValue}.`
          );
        }

        const type = pointerStart.type.type;

        let offsetMultiple = 1;

        if (type.includes("16")) {
          offsetMultiple = 2;
        } else if (type.includes("32")) {
          offsetMultiple = 4;
        } else if (type.includes("64")) {
          offsetMultiple = 8;
        }

        // If the left side is a dereference, store the memory address for later
        const address = this.getDereferenceAddress({
          nodeType: "typedRuntimeValue",
          type: pointerStart.type,
          value: {
            nodeType: "literal",
            literal: {
              nodeType: "integer",
              value: pointerStartValue + pointerOffsetValue * offsetMultiple,
            },
          },
        });

        if (address < 0 || address >= state.heap.length) {
          throw new Error(
            `Runtime error: Address ${address} is outside of the addressable memory range.`
          );
        }

        if (type === "uint8_t" || type === "int8_t") {
          memWriteInfo = {
            type: "integer",
            address,
            bits: 8,
            signed: !type.startsWith("u"),
          };
        } else if (type === "uint16_t" || type === "int16_t") {
          memWriteInfo = {
            type: "integer",
            address,
            bits: 16,
            signed: !type.startsWith("u"),
          };
        } else if (type === "uint32_t" || type === "int32_t") {
          memWriteInfo = {
            type: "integer",
            address,
            bits: 32,
            signed: !type.startsWith("u"),
          };
        } else if (type === "uint64_t" || type === "int64_t") {
          memWriteInfo = {
            type: "integer",
            address,
            bits: 64,
            signed: !type.startsWith("u"),
          };
        } else if (type === "float" || type === "double") {
          memWriteInfo = {
            type: "float",
            address,
            double: type === "double",
          };
        } else {
          throw new Error(`Internal error: Unexpected pointer type ${type}.`);
        }
      }

      // Evaluate the right-hand side of the assignment
      const value = this.evaluate(statement.right);

      if (value.nodeType === "void") {
        throw new Error(`Runtime error: Cannot assign void to variable.`);
      }

      let scopeItem: TypedRuntimeValueNode;

      if (memWriteInfo !== undefined) {
        const coerced = coerce(
          {
            nodeType: "untypedRuntimeValue",
            value: value.value,
          },
          {
            nodeType: "type",
            type: memWriteInfo.type === "float" ? "double" : "uint64_t",
            isPointer: false,
          }
        );
        if (coerced.value.nodeType !== "literal") {
          throw new Error(
            `Internal error: Expected coerced value to be of type "literal", but got ${coerced.value.nodeType}.`
          );
        } else if (
          coerced.value.literal.nodeType !== "integer" &&
          coerced.value.literal.nodeType !== "double"
        ) {
          throw new Error(
            `Internal error: Expected coerced value to be of type "integer" or "double", but got ${coerced.value.literal.nodeType}.`
          );
        }

        const heapValueRaw = coerced.value.literal.value;

        const bytes =
          memWriteInfo.type === "integer"
            ? numToBytes(heapValueRaw, memWriteInfo.bits, memWriteInfo.signed)
            : numToBytesFloat(heapValueRaw, memWriteInfo.double);

        this.writeToHeap(memWriteInfo.address, bytes);

        return coerced;
      }
      // Set the value in the global scope
      else if (statement.left.nodeType === "identifier") {
        scopeItem = coerce(
          {
            nodeType: "untypedRuntimeValue",
            value: value.value,
          },
          this.globalScope[statement.left.identifier].type
        );
        this.globalScope[statement.left.identifier] = scopeItem;
      } else if (statement.left.nodeType === "declaration") {
        scopeItem = coerce(
          {
            nodeType: "untypedRuntimeValue",
            value: value.value,
          },
          statement.left.declaration.type
        );
        this.globalScope[statement.left.declaration.identifier.identifier] =
          scopeItem;
      } else {
        throw new Error(
          `Internal error: Unexpected assignment left-hand side node type.`
        );
      }

      return scopeItem;
    } else if (statement.nodeType === "functionCall") {
      const funcRuntimeValue = this.evaluate(statement.functionName);

      if (funcRuntimeValue.nodeType === "void") {
        throw new Error(
          `Type error: Identifier ${statement.functionName.identifier} is not a function.`
        );
      }

      const func = funcRuntimeValue.value;

      if (func.nodeType === "nativeFunctionDefinition") {
        const args = statement.arguments
          .map((arg) => (arg.nodeType === "type" ? arg : this.evaluate(arg)))
          .filter(
            (arg) =>
              arg.nodeType === "typedRuntimeValue" ||
              arg.nodeType === "untypedRuntimeValue" ||
              arg.nodeType === "type"
          );

        // Validate argument count
        if (args.length !== func.arguments.length) {
          throw new Error(
            `Type error: Expected ${func.arguments.length} argument${
              func.arguments.length === 1 ? "" : "s"
            } for function ${statement.functionName.identifier}, but got ${
              args.length
            }.`
          );
        }

        // Validate argument types
        for (let i = 0; i < args.length; i++) {
          const funcArg = func.arguments[i];
          const inputArg = args[i];
          if (funcArg.nodeType === "type" && inputArg.nodeType === "type") {
            continue;
          }

          if (
            funcArg.nodeType === "type" &&
            (inputArg.nodeType === "untypedRuntimeValue" ||
              inputArg.nodeType === "typedRuntimeValue")
          ) {
            throw new Error(
              `Type error: Expected argument ${i} to be of type ${funcArg.type}, but got a runtime value.`
            );
          }

          if (
            funcArg.nodeType === "declaration" &&
            inputArg.nodeType === "type"
          ) {
            throw new Error(
              `Type error: Expected argument ${i} to be a runtime value, but got a type.`
            );
          }

          if (
            funcArg.nodeType !== "declaration" ||
            (inputArg.nodeType !== "untypedRuntimeValue" &&
              inputArg.nodeType !== "typedRuntimeValue")
          ) {
            throw new Error(
              `Internal error: Unexpected argument node type for function ${statement.functionName.identifier}.`
            );
          }

          // Commenting this out. Functions must be in charge of type checking
          // and maybe coercing their own arguments.

          // if (inputArg.type.type !== funcArg.declaration.type.type) {
          //   throw new Error(
          //     `Type error: ${statement.functionName.identifier}: Expected argument ${i} to be of type ${funcArg.declaration.type.type}, but got ${inputArg.type.type}.`
          //   );
          // }
        }

        return func.body(args);
      } else {
        throw new Error(
          `Type error: Identifier ${statement.functionName.identifier} is not a function.`
        );
      }
    } else if (statement.nodeType === "dereference") {
      const runtimeValue = this.evaluate(statement.statement);

      if (runtimeValue.nodeType === "void") {
        throw new Error(`Runtime error: Cannot dereference void value.`);
      }

      if (runtimeValue.nodeType === "untypedRuntimeValue") {
        throw new Error(`Cannot dereference literal value.`);
      }

      const address = this.getDereferenceAddress(runtimeValue);

      if (address < 0 || address >= state.heap.length) {
        throw new Error(
          `Runtime error: Address ${address} is outside of the addressable memory range.`
        );
      }

      let bytes: number[] = [];
      let bits: 8 | 16 | 32 | 64 = 8;

      const type = runtimeValue.type.type;

      if (type === "double" || type === "float") {
        return {
          nodeType: "untypedRuntimeValue",
          value: {
            nodeType: "literal",
            literal: {
              nodeType: "double",
              value: bytesToNumFloat(
                this.readFromHeap(address, 8),
                type === "double"
              ),
            },
          },
        };
      }

      if (type === "uint8_t" || type === "int8_t") {
        bytes = this.readFromHeap(address, 1);
        bits = 8;
      } else if (type === "uint16_t" || type === "int16_t") {
        bytes = this.readFromHeap(address, 2);
        bits = 16;
      } else if (type === "uint32_t" || type === "int32_t") {
        bytes = this.readFromHeap(address, 4);
        bits = 32;
      } else if (type === "uint64_t" || type === "int64_t") {
        bytes = this.readFromHeap(address, 8);
        bits = 64;
      } else {
        throw new Error(
          `Internal error: Unexpected pointer type ${runtimeValue.type.type}.`
        );
      }

      const signed = !type.startsWith("u");

      return {
        nodeType: "untypedRuntimeValue",
        value: {
          nodeType: "literal",
          literal: {
            nodeType: "integer",
            value: bytesToNum(bytes, bits, signed),
          },
        },
      };
    } else if (statement.nodeType === "type") {
      return { nodeType: "void" };
    } else if (statement.nodeType === "arrayAccess") {
      const pointerStart = this.evaluate(statement.identifier);

      if (pointerStart.nodeType === "void") {
        throw new Error(`Runtime error: Cannot dereference void value.`);
      }

      if (pointerStart.nodeType === "untypedRuntimeValue") {
        throw new Error(`Runtime error: Cannot dereference literal value.`);
      }

      if (pointerStart.value.nodeType !== "literal") {
        throw new Error(
          `Internal error: Expected pointer start to be of type "literal", but got ${pointerStart.value.nodeType}.`
        );
      }

      const pointerStartValue = pointerStart.value.literal.value;

      if (typeof pointerStartValue !== "number") {
        throw new Error(
          `Internal error: Expected pointer start value to be a number, but got ${typeof pointerStartValue}.`
        );
      }

      const pointerOffset = this.evaluate(statement.value);

      if (pointerOffset.nodeType === "void") {
        throw new Error(`Runtime error: Cannot dereference void value.`);
      }

      if (pointerOffset.value.nodeType !== "literal") {
        throw new Error(
          `Internal error: Expected pointer offset to be of type "literal", but got ${pointerOffset.value.nodeType}.`
        );
      }

      const pointerOffsetValue = pointerOffset.value.literal.value;

      if (typeof pointerOffsetValue !== "number") {
        throw new Error(
          `Internal error: Expected pointer offset value to be a number, but got ${typeof pointerOffsetValue}.`
        );
      }

      const type = pointerStart.type.type;

      let offsetMultiple = 1;

      if (type.includes("16")) {
        offsetMultiple = 2;
      } else if (type.includes("32")) {
        offsetMultiple = 4;
      } else if (type.includes("64")) {
        offsetMultiple = 8;
      }

      const address = pointerStartValue + pointerOffsetValue * offsetMultiple;

      if (address < 0 || address >= state.heap.length) {
        throw new Error(
          `Runtime error: Address ${address} is outside of the addressable memory range.`
        );
      }

      let bytes: number[] = [];
      let bits: 8 | 16 | 32 | 64 = 8;

      if (type === "uint8_t" || type === "int8_t") {
        bytes = this.readFromHeap(address, 1);
        bits = 8;
      } else if (type === "uint16_t" || type === "int16_t") {
        bytes = this.readFromHeap(address, 2);
        bits = 16;
      } else if (type === "uint32_t" || type === "int32_t") {
        bytes = this.readFromHeap(address, 4);
        bits = 32;
      } else if (type === "uint64_t" || type === "int64_t") {
        bytes = this.readFromHeap(address, 8);
        bits = 64;
      }

      const signed = !type.startsWith("u");

      return {
        nodeType: "untypedRuntimeValue",
        value: {
          nodeType: "literal",
          literal: {
            nodeType: "integer",
            value: bytesToNum(bytes, bits, signed),
          },
        },
      };
    } else {
      const nodeType = (statement as StatementNode).nodeType;

      throw Error(
        `Internal error: Unexpected statement node type ${nodeType}.`
      );
    }
  }

  private getDereferenceAddress(value: TypedRuntimeValueNode): number {
    if (value.type.type === "nativeFunction") {
      throw new Error(`Type error: Cannot dereference native function.`);
    }

    if (!value.type.isPointer) {
      throw new Error(
        `Type error: Cannot dereference non-pointer type ${value.type.type}.`
      );
    }

    if (value.value.nodeType !== "literal") {
      throw new Error(
        `Internal error: Expected variable value to be of type "literal", but got ${value.value.nodeType}.`
      );
    }

    const coercedValue = coerceLiteralToU8(value.value).literal;
    if (coercedValue.nodeType !== "integer") {
      throw new Error(
        `Internal error: Expected coerced value to be of type "integer", but got ${coercedValue.nodeType}.`
      );
    }

    const address = coercedValue.value;

    return address;
  }

  private readFromHeap(address: number, numBytes: number): number[] {
    if (address < 0 || address + numBytes > state.heap.length) {
      throw new Error(
        `Segmentation fault: Attempted to read outside of the heap bounds.`
      );
    }

    return state.heap.slice(address, address + numBytes);
  }

  private writeToHeap(address: number, bytes: number[]): void {
    if (address < 0 || address + bytes.length > state.heap.length) {
      throw new Error(
        `Segmentation fault: Attempted to write outside of the heap bounds.`
      );
    }

    for (let i = 0; i < bytes.length; i++) {
      state.heap[address + i] = bytes[i];
    }
  }
}

const engine = new Engine();

export default engine;
export type { Scope, UntypedRuntimeValueNode, VoidNode, TypedRuntimeValueNode };
