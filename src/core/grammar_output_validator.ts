// This file contains a Zod validator for the Nearley parser output.
//
// Zod statically generates the types we use elsewhere in the application. As
// long as the parser output passes validation at runtime, the types pulled from
// this file will always be correct.

import { z, ZodType } from "zod";

const literalSchema = z.object({
  nodeType: z.literal("literal"),
  literal: z.discriminatedUnion("nodeType", [
    z.object({ nodeType: z.literal("int"), int: z.number() }),
    z.object({ nodeType: z.literal("double"), double: z.number() }),
    z.object({ nodeType: z.literal("string"), string: z.string() }),
    z.object({ nodeType: z.literal("char"), char: z.number() }),
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
    z.literal("string"),
    z.literal("char"),
    z.literal("char*"),
    z.literal("void"),
    z.literal("void*"),

    // The grammar should never output this, but this adds it to TypeNode.type
    // so that we can use it in the runtime engine.
    z.literal("nativeFunction"),
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
    arguments: statementSchema.array(),
  })
);
type FunctionCallNode = {
  nodeType: "functionCall";
  functionName: IdentifierNode;
  arguments: StatementNode[];
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
    left: z.union([
      declarationSchema,
      identifierSchema,
      arrayIndexSchema,
      dereferenceSchema,
    ]),
    right: statementSchema,
  })
);
type AssignmentNode = {
  nodeType: "assignment";
  left: DeclarationNode | IdentifierNode | ArrayIndexNode | DereferenceNode;
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

const dereferenceSchema: ZodType<DereferenceNode> = z.lazy(() =>
  z.object({
    nodeType: z.literal("dereference"),
    statement: statementSchema,
  })
);
type DereferenceNode = {
  nodeType: "dereference";
  statement: StatementNode;
};

const operatorSchema: ZodType<OperatorNode> = z.lazy(() =>
  z.object({
    nodeType: z.literal("operator"),
    operator: z.union([
      z.literal("+"),
      z.literal("-"),
      z.literal("*"),
      z.literal("/"),
    ]),
    left: z.union([
      literalSchema,
      identifierSchema,
      functionCallSchema,
      parenthesisSchema,
    ]),
    right: z.union([
      literalSchema,
      identifierSchema,
      functionCallSchema,
      parenthesisSchema,
    ]),
  })
);
type OperatorNode = {
  nodeType: "operator";
  operator: "+" | "-" | "*" | "/";
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
    parenthesisSchema,
    dereferenceSchema,
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
  | ParenthesisNode
  | DereferenceNode;

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
  DereferenceNode,
};
export default statementSchema;
