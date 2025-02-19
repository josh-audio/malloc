import state from "../../state/state";
import {
  DeclarationNode,
  LiteralNode,
  StatementNode,
} from "../grammar_output_validator";
import { coerce } from "./coerce";
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

type Scope = Record<string, LiteralNode | NativeFunctionDefinitionNode>;

class Engine {
  globalScope: Scope = {
    malloc: {
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
    clear: {
      nodeType: "nativeFunctionDefinition",
      arguments: [],
      body: () => {
        state.commandHistory = [];
        return { nodeType: "void" };
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

      if (
        type === "char*" ||
        type === "double*" ||
        type === "int*" ||
        type === "void*"
      ) {
        throw new Error(`Internal error: Pointer types are not yet supported.`);
      }

      if (type === "void") {
        throw new Error('Type error: Cannot declare variable of type "void".');
      }

      if (statement.declaration.type.type === "string") {
        this.globalScope[statement.declaration.identifier.identifier] = {
          nodeType: "literal",
          literal: {
            nodeType: "string",
            string: "",
          },
        };
      } else {
        this.globalScope[statement.declaration.identifier.identifier] = coerce(
          {
            nodeType: "literal",
            literal: {
              nodeType: "int",
              int: "0",
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
          `Runtime error: Identifier ${statement.identifier} is not defined.`
        );
      }

      return value;
    } else if (statement.nodeType === "assignment") {
      // Evaluate the declaration
      if (statement.left.nodeType === "declaration") {
        this.evaluate(statement.left);
      }

      // Evaluate the right-hand side of the assignment
      const value = this.evaluate(statement.right);

      if (value.nodeType === "void") {
        throw new Error(`Runtime error: Cannot assign void to variable.`);
      }

      // Set the value in the global scope
      if (statement.left.nodeType === "identifier") {
        this.globalScope[statement.left.identifier] = value;
      } else if (statement.left.nodeType === "declaration") {
        this.globalScope[statement.left.declaration.identifier.identifier] =
          value;
      } else {
        throw new Error(
          `Internal error: Unexpected assignment left-hand side node type.`
        );
      }

      return value;
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
    }

    throw Error("Internal error: Unexpected statement node type.");
  }
}

const engine = new Engine();

export default engine;
export type { Scope };
