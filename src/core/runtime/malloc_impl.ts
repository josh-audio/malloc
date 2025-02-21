import { RuntimeValueNode, Scope } from "./engine";

const mallocImpl = (scope: Scope, args: RuntimeValueNode[]): RuntimeValueNode => {
  return {
    nodeType: "runtimeValue",
    type: {
      nodeType: "type",
      type: "void*",
    },
    value: {
      nodeType: "literal",
      literal: {
        nodeType: "string",
        string: `${scope["test"]} ${args.length}`,
      },
    },
  };
};

export { mallocImpl };
