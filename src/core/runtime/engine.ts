import state from "../../state/state";
import {
  DeclarationNode,
  DereferenceNode,
  LiteralNode,
  StatementNode,
  TypeNode,
} from "../grammar_output_validator";
import { coerce, coerceToChar, coerceToInt } from "./coerce";
import { mallocImpl } from "./malloc_impl";
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
  arguments: DeclarationNode[];
  body: (args: LiteralNode[]) => LiteralNode | VoidNode;
};

type VariableNode = {
  nodeType: "variableValue";
  type: TypeNode;
  value: LiteralNode | NativeFunctionDefinitionNode;
};

type Scope = Record<string, VariableNode>;

class Engine {
  globalScope: Scope = {
    malloc: {
      nodeType: "variableValue",
      type: {
        nodeType: "type",
        type: "nativeFunction",
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
                type: "int",
              },
            },
          },
        ],
        body: (args: LiteralNode[]) => mallocImpl(engine.globalScope, args),
      },
    },
    clear: {
      nodeType: "variableValue",
      type: {
        nodeType: "type",
        type: "nativeFunction",
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
      nodeType: "variableValue",
      type: {
        nodeType: "type",
        type: "nativeFunction",
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
                type: "int",
              },
            },
          },
        ],
        body: (args: LiteralNode[]) => {
          if (args[0].literal.nodeType !== "int") {
            throw new Error(
              `Internal error: Expected argument 0 to be of type int, but got ${args[0].literal.nodeType}.`
            );
          }

          const base = parseInt(args[0].literal.int);

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
  };

  // Recursively evaluates the given statement. Returns a literal node if the
  // statement evaluates to a value, otherwise returns a void node.
  evaluate(
    statement: StatementNode
  ): LiteralNode | NativeFunctionDefinitionNode | VoidNode {
    if (statement.nodeType === "literal") {
      return statement;
    } else if (statement.nodeType === "operator") {
      const left = this.evaluate(statement.left);
      const right = this.evaluate(statement.right);

      if (
        left.nodeType === "nativeFunctionDefinition" ||
        right.nodeType === "nativeFunctionDefinition"
      ) {
        throw new Error(
          `Type error: Invalid type "native function" for operator ${statement.operator}.`
        );
      }

      if (left.nodeType === "void") {
        throw new Error(
          `Runtime error: Left-hand side of operator ${statement.operator} is void.`
        );
      } else if (right.nodeType === "void") {
        throw new Error(
          `Runtime error: Right-hand side of operator ${statement.operator} is void.`
        );
      }

      if (statement.operator === "+") {
        return coerceOperatorPlus(left, right);
      } else if (statement.operator === "-") {
        return coerceOperatorMinus(left, right);
      } else if (statement.operator === "*") {
        return coerceOperatorMultiply(left, right);
      } else if (statement.operator === "/") {
        return coerceOperatorDivide(left, right);
      }

      throw Error(`Internal error: Unexpected operator ${statement.operator}.`);
    } else if (statement.nodeType === "cast") {
      const result = this.evaluate(statement.statement);

      if (result.nodeType === "nativeFunctionDefinition") {
        throw new Error(
          `Type error: Type "native function" cannot be cast to ${statement.type.type}.`
        );
      }

      if (result.nodeType === "void") {
        throw new Error(
          `Runtime error: Type "void" cannot be cast to ${statement.type.type}.`
        );
      }

      return coerce(result, statement.type);
    } else if (statement.nodeType == "parenthesis") {
      return this.evaluate(statement.statement);
    } else if (statement.nodeType === "declaration") {
      const type = statement.declaration.type.type;

      if (type === "void") {
        throw new Error('Type error: Cannot declare variable of type "void".');
      }

      if (statement.declaration.type.type === "string") {
        this.globalScope[statement.declaration.identifier.identifier] = {
          nodeType: "variableValue",
          type: statement.declaration.type,
          value: {
            nodeType: "literal",
            literal: {
              nodeType: "string",
              string: "",
            },
          },
        };
      } else {
        this.globalScope[statement.declaration.identifier.identifier] = {
          nodeType: "variableValue",
          type: statement.declaration.type,
          value: coerce(
            {
              nodeType: "literal",
              literal: {
                nodeType: "int",
                int: "0",
              },
            },
            statement.declaration.type
          ),
        };
      }

      return { nodeType: "void" };
    } else if (statement.nodeType === "identifier") {
      const value = this.globalScope[statement.identifier];

      if (value === undefined) {
        throw new Error(
          `Runtime error: Identifier ${statement.identifier} is not defined.`
        );
      }

      return value.value;
    } else if (statement.nodeType === "assignment") {
      let address: number | undefined;

      // Evaluate the declaration
      if (statement.left.nodeType === "declaration") {
        this.evaluate(statement.left);
      } else if (statement.left.nodeType === "dereference") {
        address = this.getDereferenceAddress(statement.left);

        if (address < 0 || address >= state.heap.length) {
          throw new Error(
            `Runtime error: Address ${address} is outside of the addressable memory range.`
          );
        }
      }

      // Evaluate the right-hand side of the assignment
      const value = this.evaluate(statement.right);

      if (value.nodeType === "void") {
        throw new Error(`Runtime error: Cannot assign void to variable.`);
      } else if (value.nodeType === "nativeFunctionDefinition") {
        throw new Error(
          `Type error: Cannot assign native function to a variable.`
        );
      }

      let scopeItem: VariableNode;

      if (address !== undefined) {
        const coerced = coerce(value, { nodeType: "type", type: "int" });
        if (coerced.literal.nodeType !== "int") {
          throw new Error(
            `Internal error: Expected coerced value to be of type "int", but got ${coerced.literal.nodeType}.`
          );
        }

        const heapValueRaw = parseInt(coerced.literal.int);

        if (heapValueRaw < 0) {
          const value = Math.abs(heapValueRaw) % 256;
          state.heap[address].value = 256 - value;
        } else {
          state.heap[address].value = heapValueRaw % 256;
        }

        return coerced;
      }
      // Set the value in the global scope
      else if (statement.left.nodeType === "identifier") {
        scopeItem = this.globalScope[statement.left.identifier];
        scopeItem.value = coerce(value, scopeItem.type);
      } else if (statement.left.nodeType === "declaration") {
        scopeItem =
          this.globalScope[statement.left.declaration.identifier.identifier];
        scopeItem.value = coerce(value, statement.left.declaration.type);
      } else {
        throw new Error(
          `Internal error: Unexpected assignment left-hand side node type.`
        );
      }

      return scopeItem.value;
    } else if (statement.nodeType === "functionCall") {
      const func = this.evaluate(statement.functionName);

      if (func.nodeType === "nativeFunctionDefinition") {
        const args = statement.arguments
          .map((arg) => this.evaluate(arg))
          .filter((arg) => arg.nodeType === "literal");

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
          if (
            args[i].literal.nodeType !== func.arguments[i].declaration.type.type
          ) {
            throw new Error(
              `Type error: ${statement.functionName.identifier}: Expected argument ${i} to be of type ${func.arguments[i].declaration.type.type}, but got ${args[i].literal.nodeType}.`
            );
          }
        }

        return func.body(args);
      } else {
        throw new Error(
          `Type error: Identifier ${statement.functionName.identifier} is not a function.`
        );
      }
    } else if (statement.nodeType === "dereference") {
      const variable = this.globalScope[statement.identifier.identifier];

      const address = this.getDereferenceAddress(statement);

      if (address < 0 || address >= state.heap.length) {
        throw new Error(
          `Runtime error: Address ${address} in variable ${statement.identifier.identifier} is outside of the addressable memory range.`
        );
      }

      const value: LiteralNode = {
        nodeType: "literal",
        literal: { nodeType: "int", int: state.heap[address].value.toString() },
      };

      if (variable.type.type === "int*") {
        return value;
      } else if (variable.type.type === "char*") {
        return coerceToChar(value);
      } else {
        throw new Error(
          `Internal error: Unexpected pointer type ${variable.type.type}.`
        );
      }
    }

    throw Error("Internal error: Unexpected statement node type.");
  }

  private getDereferenceAddress(statement: DereferenceNode): number {
    const variable = this.globalScope[statement.identifier.identifier];

    if (variable === undefined) {
      throw new Error(
        `Runtime error: Identifier ${statement.identifier.identifier} is not defined.`
      );
    }

    if (variable.type.type === "nativeFunction") {
      throw new Error(
        `Type error: Cannot dereference native function ${statement.identifier.identifier}.`
      );
    }

    if (variable.type.type[variable.type.type.length - 1] !== "*") {
      throw new Error(
        `Type error: Cannot dereference non-pointer type ${variable.type.type}.`
      );
    }

    if (variable.value.nodeType !== "literal") {
      throw new Error(
        `Internal error: Expected variable value to be of type "literal", but got ${variable.value.nodeType}.`
      );
    }

    const coercedValue = coerceToInt(variable.value).literal;
    if (coercedValue.nodeType !== "int") {
      throw new Error(
        `Internal error: Expected coerced value to be of type "int", but got ${coercedValue.nodeType}.`
      );
    }

    const address = parseInt(coercedValue.int);

    return address;
  }
}

const engine = new Engine();

export default engine;
export type { Scope };
