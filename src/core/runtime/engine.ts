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
    }

    throw Error("Internal error: Unexpected statement node type.");
  }
}

const engine = new Engine();

export default engine;
