import { LiteralNode } from "../grammar_output_validator";
import { Scope } from "./engine";

const mallocImpl = ( scope: Scope, args: LiteralNode[]): LiteralNode => {
  return {
    nodeType: "literal",
    literal: {
      nodeType: "string",
      string: `${scope['test']} ${args.length}`,
    },
  }
};

export { mallocImpl };
