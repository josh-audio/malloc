import { LiteralNode, StatementNode } from "../grammar_output_validator";
import { coerce } from "./coerce";
import {
  coerceOperatorDivide,
  coerceOperatorMinus,
  coerceOperatorMultiply,
  coerceOperatorPlus,
} from "./operators";

type VoidNode = {
  nodeType: "void";
};

class Engine {
  globalScope: Record<string, LiteralNode> = {};

  // Recursively evaluates the given statement. Returns a literal node if the
  // statement evaluates to a value, otherwise returns a void node.
  evaluate(statement: StatementNode): LiteralNode | VoidNode {
    if (statement.nodeType === "literal") {
      return statement;
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

      if (result.nodeType === "void") {
        throw new Error(
          `Runtime error: Cannot cast void to ${statement.type.type}.`
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
        throw new Error(`Runtime error: Identifier ${statement.identifier} is not defined.`);
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
        this.globalScope[statement.left.declaration.identifier.identifier] = value;
      } else {
        throw new Error(`Internal error: Unexpected assignment left-hand side node type.`);
      }

      return value;
    }

    throw Error("Internal error: Unexpected statement node type.");
  }
}

const engine = new Engine();

export default engine;
