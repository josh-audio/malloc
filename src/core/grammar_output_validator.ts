// This file contains a Zod validator for the Nearley parser output.
//
// The Nearley output is being validated to ensure that the types we use in the
// application to represent the parser output match the actual output of the
// parser. This makes it easier to catch errors if the real parser output
// changes but the application code is not updated to match.

import { z, ZodType } from "zod";

const literalSchema = z.object({
  nodeType: z.literal("literal"),
  literal: z.discriminatedUnion("nodeType", [
    z.object({ nodeType: z.literal("int"), int: z.string() }),
    z.object({ nodeType: z.literal("double"), double: z.string() }),
    z.object({ nodeType: z.literal("string"), string: z.string() }),
    z.object({ nodeType: z.literal("char"), char: z.string() }),
  ]),
});
type LiteralNode = z.infer<typeof literalSchema>;

const identifierSchema = z.object({
  nodeType: z.literal("identifier"),
  identifier: z.string(),
});
type IdentifierNode = z.infer<typeof identifierSchema>;

const typeSchema = z.object({
  nodeType: z.literal("type"),
  type: z.union([
    z.literal("int"),
    z.literal("int*"),
    z.literal("double"),
    z.literal("double*"),
    z.literal("string"),
    z.literal("char"),
    z.literal("char*"),
    z.literal("void"),
    z.literal("void*"),
  ]),
});
type TypeNode = z.infer<typeof typeSchema>;

const declarationSchema = z.object({
  nodeType: z.literal("declaration"),
  declaration: z.union([
    z.object({
      nodeType: z.literal("singleDeclaration"),
      type: typeSchema,
      identifier: identifierSchema,
    }),
    z.object({
      nodeType: z.literal("arrayDeclaration"),
      type: typeSchema,
      identifier: identifierSchema,
      size: z.string(),
    }),
  ]),
});
type DeclarationNode = z.infer<typeof declarationSchema>;

const functionCallSchema: ZodType<FunctionCallNode> = z.lazy(() =>
  z.object({
    nodeType: z.literal("functionCall"),
    functionName: identifierSchema,
    argument: z.union([statementSchema, z.null()]),
  })
);
type FunctionCallNode = {
  nodeType: "functionCall";
  functionName: IdentifierNode;
  argument: StatementNode | null;
};

// This is unnecessarily specific - should generalize it to parse into an operator
const arrayIndexSchema: ZodType<ArrayIndexNode> = z.lazy(() =>
  z.object({
    nodeType: z.literal("arrayIndex"),
    identifier: identifierSchema,
    value: statementSchema,
  })
);
type ArrayIndexNode = {
  nodeType: "arrayIndex";
  identifier: IdentifierNode;
  value: StatementNode;
};

const assignmentSchema: ZodType<AssignmentNode> = z.lazy(() =>
  z.object({
    nodeType: z.literal("assignment"),
    left: z.union([declarationSchema, identifierSchema, arrayIndexSchema]),
    right: statementSchema,
  })
);
type AssignmentNode = {
  nodeType: "assignment";
  left: DeclarationNode | IdentifierNode | ArrayIndexNode;
  right: StatementNode;
};

const castSchema: ZodType<CastNode> = z.lazy(() =>
  z.object({
    nodeType: z.literal("cast"),
    type: typeSchema,
    statement: statementSchema,
  })
);
type CastNode = {
  nodeType: "cast";
  type: TypeNode;
  statement: StatementNode;
};

const operatorSchema: ZodType<OperatorNode> = z.lazy(() => z.object({
  nodeType: z.literal("operator"),
  operator: z.union([
    z.literal('+'),
    z.literal('-'),
    z.literal('*'),
    z.literal('/'),
  ]),
  left: z.union([literalSchema, identifierSchema, functionCallSchema, parenthesisSchema]),
  right: z.union([literalSchema, identifierSchema, functionCallSchema, parenthesisSchema]),
}));
type OperatorNode = {
  nodeType: "operator";
  operator: '+' | '-' | '*' | '/';
  left: LiteralNode | IdentifierNode | FunctionCallNode | ParenthesisNode;
  right: LiteralNode | IdentifierNode | FunctionCallNode | ParenthesisNode;
};

const parenthesisSchema: ZodType<ParenthesisNode> = z.lazy(() =>
  z.object({
    nodeType: z.literal("parenthesis"),
    statement: statementSchema,
  })
);
type ParenthesisNode = {
  nodeType: "parenthesis";
  statement: StatementNode;
};

const statementSchema: ZodType<StatementNode> = z.lazy(() =>
  z.union([
    literalSchema,
    identifierSchema,
    declarationSchema,
    functionCallSchema,
    arrayIndexSchema,
    assignmentSchema,
    castSchema,
    operatorSchema,
  ])
);
type StatementNode =
  | LiteralNode
  | IdentifierNode
  | DeclarationNode
  | FunctionCallNode
  | ArrayIndexNode
  | AssignmentNode
  | CastNode
  | OperatorNode
  | ParenthesisNode;

export type {
  StatementNode,
  LiteralNode,
  IdentifierNode,
  TypeNode,
  DeclarationNode,
  FunctionCallNode,
  ArrayIndexNode,
  AssignmentNode,
  CastNode,
  OperatorNode,
  ParenthesisNode,
};
export default statementSchema;
