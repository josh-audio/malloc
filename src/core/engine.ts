// Represents a value at runtime. This can be:
// - a value, e.g. 5, "hello", etc.
// - a built-in function, e.g. malloc(), free(), etc.
// - a type, e.g. int, double, etc.

import state from "../state/state";
import { LiteralNode, StatementNode } from "./grammar_output_validator";

// - a built-in action to be handled by the interpreter, e.g. the output of clearConsole()
type RuntimeToken = Value | Action | Type;

type Value = {
  nodeType: "variable";
} & ValueUnion;

type ValueUnion =
  | {
      type: "string";
      value: string;
    }
  | {
      type: "int";
      value: number;
    }
  | {
      type: "double";
      value: number;
    }
  | {
      type: "char";
      value: string;
    }
  | {
      type: "function";
      value: (arg?: unknown) => RuntimeToken;
    }
  | {
      type: "void";
    };

type Type = {
  nodeType: "type";
} & TypeUnion;

type TypeUnion =
  | {
      type: "int";
    }
  | {
      type: "double";
    }
  | {
      type: "string";
    }
  | {
      type: "char";
    };

const argumentIsValue = (argument: unknown): argument is Value => {
  return (
    typeof argument === "object" &&
    argument !== null &&
    "nodeType" in argument &&
    argument.nodeType === "variable"
  );
};

type Action = {
  nodeType: "action";
  action: "clearConsole";
};

class Engine {
  variables: Record<string, RuntimeToken> = {};

  constructor() {
    this.reset();
  }

  reset() {
    state.heap = [];
    for (let i = 0; i < state.memorySize; i++) {
      state.heap.push({
        isAllocated: false,
        isReserved: false,
        value: 0,
      });
    }
    state.heap[0].isReserved = true;

    // key: variable identifier
    // value: {nodeType: 'variable', type: 'someType', value: someValue}
    this.variables = {
      help: {
        nodeType: "variable",
        type: "function",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        value: () => {
          return (
            "\n- Commands use C-style syntax.\n" +
            "- Variable declaration and assignment is supported.\n" +
            "- Intelligent live suggestions are provided. You can use tab to insert a suggestion.\n" +
            "- The following functions are available:\n" +
            "  - malloc(int)\n" +
            "  - free(int)\n" +
            "  - freeAll()\n" +
            "  - coalesce()\n" +
            "  - setMemorySize(int)\n" +
            "  - sizeof(any)\n" +
            '  - setAllocationMethod("best fit" | "worst fit" | "first fit")\n' +
            "  - getAllocationMethod()\n" +
            "  - reset()\n" +
            "  - clearConsole()"
          );
        },
      },
      reset: {
        nodeType: "variable",
        type: "function",
        value: () => {
          this.reset();
          const variable: Value = {
            nodeType: "variable",
            type: "void",
          };
          return variable;
        },
      },
      clearConsole: {
        nodeType: "variable",
        type: "function",
        value: () => {
          return {
            nodeType: "action",
            action: "clearConsole",
          };
        },
      },
      malloc: {
        nodeType: "variable",
        type: "function",
        value: (argument: unknown) => {
          if (typeof argument === "string") {
            argument = parseInt(argument);
          }

          if (typeof argument !== "number") {
            throw new Error(
              'Syntax error ("malloc()"):\n  Expected 1 argument of type "int", got ' +
                typeof argument +
                "."
            );
          }

          const result = this.malloc(argument);
          return {
            nodeType: "variable",
            type: "int",
            value: result,
          };
        },
      },
      free: {
        nodeType: "variable",
        type: "function",
        value: (argument: unknown) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this.free(argument);
          return {
            nodeType: "variable",
            type: "void",
          };
        },
      },
      freeAll: {
        nodeType: "variable",
        type: "function",
        value: () => {
          let i = 0;

          // TODO: This is almost certainly still broken. Fixing an infinite
          // loop the dumb way for now...

          let count = 0;
          while (i !== undefined) {
            if (state.heap[i].isAllocated) {
              this.free(i + 1);
            }
            i = state.heap[i].value;
            if (count > 255) break;
            count++;
          }

          return {
            nodeType: "variable",
            type: "void",
          };
        },
      },
      setMemorySize: {
        nodeType: "variable",
        type: "function",
        value: (argument) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this.setMemorySize(argument);
          return {
            nodeType: "variable",
            type: "void",
          };
        },
      },
      coalesce: {
        nodeType: "variable",
        type: "function",
        value: () => {
          this.coalesce();
          return {
            nodeType: "variable",
            type: "void",
          };
        },
      },
      sizeof: {
        nodeType: "variable",
        type: "function",
        value: (argument: unknown) => {
          if (argument === undefined) {
            throw new Error(
              'Syntax error ("sizeof()"):\n  Expected 1 argument, got 0.'
            );
          }

          if (!argumentIsValue(argument)) {
            throw new Error(
              'Syntax error ("sizeof()"):\n  Expected 1 argument of type "int", "char", "double", or a variable, got ' +
                typeof argument +
                "."
            );
          }

          const type = argument.type;

          let val;
          switch (type) {
            case "int":
              val = 4;
              break;
            case "char":
              val = 1;
              break;
            case "double":
              val = 8;
              break;
            default:
              val = -1;
              break;
          }

          const value: Value = {
            nodeType: "variable",
            type: "int",
            value: val,
          };

          return value;
        },
      },
      setAllocationMethod: {
        nodeType: "variable",
        type: "function",
        value: (method: unknown) => {
          if (
            method === "best fit" ||
            method === "worst fit" ||
            method === "first fit"
          ) {
            this.variables.currentAllocationMethod = {
              nodeType: "variable",
              type: "string",
              value: method,
            };
            return {
              nodeType: "variable",
              type: "void",
            };
          } else {
            throw new Error(
              'Runtime exception in setAllocationMethod(): Method is invalid.\n  Valid methods are "best fit", "worst fit", and "first fit".'
            );
          }
        },
      },
      getAllocationMethod: {
        nodeType: "variable",
        type: "function",
        value: () => {
          return this.variables.currentAllocationMethod;
        },
      },
      currentAllocationMethod: {
        nodeType: "variable",
        type: "string",
        value: "first fit",
      },
      int: {
        nodeType: "type",
        type: "int",
      },
      double: {
        nodeType: "type",
        type: "double",
      },
      string: {
        nodeType: "type",
        type: "string",
      },
      char: {
        nodeType: "type",
        type: "char",
      },
    };
  }

  getIdentifiers() {
    return Object.keys(this.variables);
  }

  getFunctions() {
    return Object.keys(this.variables).filter((elem) => {
      const variable = this.variables[elem];
      return variable.nodeType === "variable" && variable.type === "function";
    });
  }

  malloc(size: number) {
    // TODO: Check on this - not sure why we're converting from string
    // if (typeof size === "string") {
    //   size = parseInt(size);
    // }

    if (size === 0) {
      throw new Error("Runtime exception in malloc():\n  Size cannot be zero.");
    } else if (size < 0) {
      throw new Error(
        "Runtime exception in malloc():\n  Size cannot be negative."
      );
    }

    let startIndex: number | undefined;

    const currentAllocationMethod = this.variables.currentAllocationMethod;
    const value =
      currentAllocationMethod.nodeType === "variable" &&
      currentAllocationMethod.type != "void"
        ? currentAllocationMethod.value
        : undefined;

    switch (value) {
      case "first fit": {
        let i = 0;
        while (i !== undefined) {
          if (!state.heap[i].isAllocated) {
            const cellVal = state.heap[i].value
              ? state.heap[i].value
              : state.heap.length;
            const currentSize = cellVal - i - 1;
            if (currentSize >= size) {
              startIndex = i;
              break;
            }
          }
          i = state.heap[i].value;
        }
        break;
      }
      case "best fit": {
        let bestSize = state.heap.length - 1; // accounts for reserved word
        let bestStart = 0;
        let i = 0;

        // TODO: This is almost certainly still broken. Fixing an infinite
        // loop the dumb way for now...

        let count = 0;
        while (i !== undefined) {
          const cellVal = state.heap[i].value
            ? state.heap[i].value
            : state.heap.length;
          if (!state.heap[i].isAllocated && cellVal - i - 1 < bestSize) {
            bestSize = cellVal - i - 1;
            bestStart = i;
          }
          i = state.heap[i].value;

          if (count > 255) break;
          count++;
        }
        if (size <= bestSize) {
          startIndex = bestStart;
        }
        break;
      }
      case "worst fit": {
        let bestSize = 0;
        let bestStart = 0;
        let i = 0;

        // TODO: This is almost certainly still broken. Fixing an infinite
        // loop the dumb way for now...

        let count = 0;
        while (i !== undefined) {
          const cellVal = state.heap[i].value
            ? state.heap[i].value
            : state.heap.length;
          if (!state.heap[i].isAllocated && cellVal - i - 1 > bestSize) {
            bestSize = cellVal - i - 1;
            bestStart = i;
          }
          i = state.heap[i].value;

          if (count > 255) break;
          count++;
        }
        if (size <= bestSize) {
          startIndex = bestStart;
        }
        break;
      }
      default:
        throw new Error(
          "Runtime exception in malloc():\n  Allocation method is invalid.\n  Hint: Don\t set currentAllocationMethod directly; instead, use setAllocationMethod()."
        );
    }

    if (startIndex === undefined) {
      throw new Error("Runtime exception in malloc(): Out of memory.");
    }

    for (let i = startIndex; i <= startIndex + size; i++) {
      state.heap[i].isAllocated = true;
    }

    state.heap[startIndex].isReserved = true;
    const oldCellValue = state.heap[startIndex].value;
    state.heap[startIndex].value = startIndex + size + 1;
    if (state.heap[startIndex].value >= state.heap.length) {
      // state.heap[startIndex].value = undefined;
      // TODO: Is this necessary? We need to transition to making memory readable anyway
    }

    if (
      state.heap[startIndex + size + 1] !== undefined &&
      !state.heap[startIndex + size + 1].isReserved
    ) {
      state.heap[startIndex + size + 1].isReserved = true;
      state.heap[startIndex + size + 1].value = oldCellValue;
    }

    return startIndex + 1;
  }

  free(ptr: number) {
    if (state.heap[ptr - 1] === undefined) {
      throw new Error(
        "Runtime exception in free():\n  Memory pointer is out of bounds."
      );
    } else if (
      !state.heap[ptr - 1].isReserved ||
      !state.heap[ptr - 1].isAllocated
    ) {
      throw new Error(
        "Runtime exception in free():\n  Memory pointer does not point to the start of an allocated chunk."
      );
    }

    state.heap[ptr - 1].isAllocated = false;

    for (let i = ptr; i < state.heap.length; i++) {
      if (state.heap[i].isReserved) {
        break;
      }
      state.heap[i].isAllocated = false;
    }
  }

  setMemorySize(size: number) {
    if (size < 1) {
      throw new Error(
        "Runtime exception in setMemorySize(): Memory size must be at least 1."
      );
    }

    if (size === state.memorySize) {
      return;
    } else if (size > state.memorySize) {
      for (let i = 0; i < size - state.memorySize; i++) {
        if (i === 0 && state.heap[state.memorySize - 1].isAllocated) {
          state.heap.push({
            isAllocated: false,
            isReserved: true,
            value: 0,
          });
        } else {
          state.heap.push({
            isAllocated: false,
            isReserved: false,
            value: 0,
          });
        }
      }
    } else {
      state.heap = state.heap.slice(0, size);

      for (let i = state.heap.length - 1; i >= 0; i--) {
        if (state.heap[i].isReserved) {
          // state.heap[i].next = undefined;
          // TODO: This is definitely not valid
          break;
        }
      }
    }

    state.memorySize = size;
  }

  coalesce() {
    let ptr = 0;

    // TODO: This is almost certainly still broken. Fixing an infinite
    // loop the dumb way for now...

    let count = 0;
    while (true) {
      if (ptr >= state.heap.length) {
        break;
      }

      if (
        state.heap[ptr].value === undefined ||
        state.heap[ptr].value < 0 ||
        state.heap[ptr].value >= state.heap.length
      ) {
        break;
      }

      if (
        !state.heap[ptr].isAllocated &&
        !state.heap[state.heap[ptr].value].isAllocated
      ) {
        const cellValuePtr = state.heap[ptr].value;
        state.heap[ptr].value = state.heap[cellValuePtr].value;
        state.heap[cellValuePtr].value = 0; // TODO: Unusure about this
        state.heap[cellValuePtr].isReserved = false;
        continue;
      }

      ptr = state.heap[ptr].value;

      if (count > 255) break;
      count++;
    }
  }

  // Groups the state into blocks to help
  // with UI structuring
  getState(): {
    blocks: {
      isAllocated: boolean;
      cells: {
        isAllocated: boolean;
        isReserved: boolean;
        value: number;
        index: number;
      }[];
    }[];
  } {
    const result: ReturnType<Engine["getState"]> = { blocks: [] };
    result.blocks = [];

    let block: ReturnType<Engine["getState"]>["blocks"][number] | undefined;
    let createNewBlock = true;
    for (let i = 0; i < state.heap.length; i++) {
      if (createNewBlock) {
        if (block !== undefined) {
          result.blocks.push(block);
        }

        block = { cells: [], isAllocated: state.heap[i].isAllocated };
      }

      block!.cells.push({ ...state.heap[i], index: i });

      createNewBlock =
        i + 1 < state.heap.length && state.heap[i + 1].isReserved;
    }

    result.blocks.push(block!);

    return result;
  }

  evaluateLiteral(node: LiteralNode['literal']): RuntimeToken {
    switch (node.nodeType) {
      case "int":
        return { nodeType: "variable", type: "int", value: parseInt(node.int) };
      case "char":
        return { nodeType: "variable", type: "char", value: node.char };
      case "double":
        return { nodeType: "variable", type: "double", value: parseFloat(node.double) };
      case "string":
        return { nodeType: "variable", type: "string", value: node.string };
    }
  }

  // Recursively evaluates a node in the AST and returns the result, along with
  // performing any side effects.
  evaluate(node: StatementNode): RuntimeToken {
    if (node === null || node === undefined) {
      return {
        nodeType: "variable",
        type: "void",
      };
    }

    if (Array.isArray(node)) {
      if (node.length === 0) {
        throw new Error(
          "Parsing error: Command is incomplete.\n  Did you forget a ')'?"
        );
      }
      return this.evaluate(node[0]);
    }

    // Check for nodeType field
    if (typeof node !== "object" || !("nodeType" in node)) {
      throw new Error(
        "Parsing error: This is not a valid AST node.\n  This is a bug."
      );
    }

    // We really need to come up with our own type set for AST nodes. For now,
    // we'll just blindly ignore.

    switch (node.nodeType) {
      case "literal": {
        return this.evaluateLiteral(node.literal);
      }
      case "identifier": {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          Object.prototype.hasOwnProperty.call(!this.variables, node.identifier)
        ) {
          throw new Error(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            `Reference error: '${node.identifier}' is not defined.`
          );
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this.variables[node.identifier];
      }
      case "assignment": {
        let identifier;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (node.left.nodeType === "identifier") {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          identifier = node.left.identifier;
          if (this.variables[identifier] === undefined) {
            throw new Error(`Reference error: '${identifier}' is not defined.`);
          }
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
        } else if (node.left.nodeType === "declaration") {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          identifier = this.evaluate(node.left).identifier;
        }

        let value;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (node.right.nodeType === "literal") {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          value = this.evaluate(node.right);

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const type = node.right.literal.nodeType;

          value = {
            nodeType: "variable",
            type: type,
            value: value,
          };
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
        } else if (node.right.nodeType === "variable") {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          value = node.right;
        } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          value = this.evaluate(node.right);
        }

        if (value.nodeType === "variable") {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (this.variables[identifier].type !== value.type) {
            if (
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              this.variables[identifier].type === "int" &&
              value.type === "double"
            ) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              this.variables[identifier].value = parseInt(value.value);
            } else if (
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              this.variables[identifier].type === "double" &&
              value.type === "int"
            ) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              this.variables[identifier].value = value.value;
            } else if (
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              (this.variables[identifier].type.endsWith("*") ||
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                this.variables[identifier].type === "int" ||
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                this.variables[identifier].type === "char") &&
              (value.type.endsWith("*") ||
                value.type === "int" ||
                value.type === "char")
            ) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              this.variables[identifier].value = value.value;
            } else {
              throw new Error(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                `Syntax error: Type mismatch between ${this.variables[identifier].type} and ${value.type}.`
              );
            }
          }
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this.variables[identifier].value = value.value;
        } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this.variables[identifier].type = "int"; // um,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this.variables[identifier].value = value;
        }

        return value;
      }
      case "functionCall": {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const func = this.evaluate(node.functionName);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (func.type !== "function") {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          throw new Error(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            `Type error: '${node.functionName.identifier}' is not a function.`
          );
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const arg = node.argument ? this.evaluate(node.argument) : undefined;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return func.value(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          arg !== undefined && arg.nodeType === "variable" ? arg.value : arg
        );
      }
      case "declaration": {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this.evaluate(node.declaration);
      }
      case "singleDeclaration": {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const type = this.evaluate(node.type);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const identifier = node.identifier.identifier;
        if (this.variables[identifier] !== undefined) {
          throw new Error(
            `Syntax error: Identifier '${identifier}' has already been declared.`
          );
        }
        this.variables[identifier] = {
          nodeType: "variable",
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          type: type,
          value: undefined,
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return node.identifier;
      }
      case "arrayDeclaration": {
        throw new Error("Array logic is not supported yet.");
      }
      case "cast": {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        let oldValue = this.evaluate(node.statement);
        let oldType;

        switch (oldValue.nodeType) {
          case undefined:
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            oldType = node.statement.literal.nodeType;
            break;
          case "variable":
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            oldType = oldValue.type;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            oldValue = oldValue.value;
            break;
          default:
            throw new Error(
              'Whatever you just did is "not supported" (probably a bug).'
            );
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        let validFromTypes = [];

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (node.type.type.endsWith("*")) {
          validFromTypes = [
            "int*",
            "double*",
            "string*",
            "char*",
            "int",
            "char",
            "void*",
          ];
        } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          switch (node.type.type) {
            case "char":
            case "int":
              if (oldType === "double") {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                oldValue = parseInt(oldValue);
              }
            // falls through
            case "double":
              validFromTypes = [
                "int",
                "int*",
                "double",
                "double*",
                "string*",
                "char*",
                "char",
                "void*",
              ];
              break;
            // no default
          }
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (!validFromTypes.includes(oldType)) {
          throw new Error(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            `Syntax error:\n  Type mismatch: Cannot cast from ${oldType} to ${node.type.type}`
          );
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return {
          nodeType: "variable",
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          type: node.type.type,
          value: oldValue,
        };
      }
      case "parenthesis": {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this.evaluate(node.statement);
      }
      case "operator": {
        let left;
        let right;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (node.left.nodeType === "literal") {
          left = {
            nodeType: "variable",
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            type: node.left.literal.nodeType,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            value: this.evaluate(node.left),
          };
        } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          left = this.evaluate(node.left);
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (node.right.nodeType === "literal") {
          right = {
            nodeType: "variable",
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            type: node.right.literal.nodeType,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            value: this.evaluate(node.right),
          };
        } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          right = this.evaluate(node.right);
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (left.value !== undefined) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const type = left.type;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          left = left.value;
          if (type === "double") {
            left = parseFloat(left);
          } else if (type === "int") {
            left = parseInt(left);
          }
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (right.value !== undefined) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const type = right.type;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          right = right.value;
          if (type === "double") {
            right = parseFloat(right);
          } else if (type === "int") {
            right = parseInt(right);
          }
        }

        if (typeof left !== typeof right) {
          throw new Error("Syntax error: Type mismatch.");
        }

        let result;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        switch (node.operator) {
          case "+":
            result = left + right;
            break;
          case "-":
            result = left - right;
            break;
          case "*":
            result = left * right;
            break;
          case "/":
            result = left / right;
            break;
          // no default
        }

        let type = typeof result;

        if (type === "number") {
          if (result % 1 === 0) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            type = "double";
          } else {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            type = "int";
          }
        }

        return {
          nodeType: "variable",
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          type: type,
          value: result,
        };
      }
      case "type": {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return node.type;
      }
      case "arrayIndex": {
        throw new Error("Array logic is not supported yet.");
      }
      default: {
        throw new Error(
          "AST evaluator: Node type was not recognized.\n  This is a bug."
        );
      }
    }
  }
}

const engine = new Engine();

export default engine;
export { Engine };
