import { LiteralNode, StatementNode } from "./grammar_output_validator";

type VoidNode = {
  nodeType: "void";
};

class Engine {
  evaluate(statement: StatementNode): LiteralNode | VoidNode {
    return { nodeType: "void" };
  }
}

const engine = new Engine();

export default engine;
