import nearley from "nearley";
import state, { CommandHistoryItem } from "../state/state";
import engine from "./runtime/engine";
import grammar from "./grammar";
import statementSchema from "./grammar_output_validator";

class Controller {
  getPrediction(input: string): string {
    const spaceSplit = input.split(" ");
    const spaceLastWord = spaceSplit[spaceSplit.length - 1];

    const parenthesisSplit = input.split("(");
    const parenthesisLastWord = parenthesisSplit[parenthesisSplit.length - 1];

    if (spaceLastWord === "" || parenthesisLastWord === "") {
      return input;
    }

    let predictions = Object.keys(engine.globalScope).map((identifier) => {
      const value = engine.globalScope[identifier].value;

      if (value.nodeType === "literal") {
        return identifier;
      } else if (value.nodeType === "nativeFunctionDefinition") {
        if (value.arguments.length > 0) {
          return `${identifier}(`;
        } else {
          return `${identifier}()`;
        }
      } else {
        throw new Error(`Unexpected value: ${identifier}`);
      }
    });

    predictions = predictions.sort();

    for (const prediction of predictions) {
      if (prediction.startsWith(spaceLastWord)) {
        spaceSplit[spaceSplit.length - 1] = prediction;
        return spaceSplit.join(" ");
      }
      if (prediction.startsWith(parenthesisLastWord)) {
        parenthesisSplit[parenthesisSplit.length - 1] = prediction;
        return parenthesisSplit.join("(");
      }
    }

    return input;
  }

  executeStatement(statement: string): void {
    const historyToAdd: CommandHistoryItem[] = [];

    historyToAdd.push({
      style: "command",
      text: statement,
    });

    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

    let syntaxError = false;

    try {
      parser.feed(statement.trim());
    } catch (ex) {
      if (!(ex instanceof Error)) {
        throw ex;
      }

      syntaxError = true;

      if (ex.message.includes("Syntax error")) {
        historyToAdd.push({
          style: "error",
          text: ex.message
            .slice(0, ex.message.search("Instead, "))
            .replace(/line [0-9]+ /, ""),
        });
      } else {
        historyToAdd.push({
          style: "error",
          text: ex.message,
        });
      }
      console.log(ex);
    }

    if (!syntaxError) {
      try {
        if (parser.results.length !== 1) {
          console.log(parser.results);
          throw new Error("Internal error: Unexpected parser output.");
        }

        const validated = statementSchema.parse(parser.results[0]);

        const result = engine.evaluate(validated);

        let outputResult: string | undefined;

        if (result.nodeType === "void") {
          outputResult = "void";
        } else if (result.nodeType === "literal") {
          if (result.literal.nodeType === "char") {
            outputResult = `'${result.literal.char}'`;
          } else if (result.literal.nodeType === "string") {
            outputResult = `"${result.literal.string}"`;
          } else if (result.literal.nodeType === "int") {
            outputResult = result.literal.int;
          } else if (result.literal.nodeType === "double") {
            outputResult = result.literal.double;
          }
        }

        historyToAdd.push({
          style: "info",
          text: `-> ${outputResult}`,
        });
      } catch (ex) {
        if (!(ex instanceof Error)) {
          throw ex;
        }

        if (ex.name === "ZodError") {
          historyToAdd.push({
            style: "error",
            text: "Internal validation error: The output from the grammar did not match the schema.",
          });
          console.log(parser.results[0]);
          console.log(ex);
        } else {
          historyToAdd.push({
            style: "error",
            text: ex.message,
          });
        }
      }
    }

    for (const historyItem of historyToAdd) {
      state.commandHistory.push(historyItem);
    }
  }

  // Gets the state for the UI
  //
  // Would be nice to refactor this a bit
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
    const result: ReturnType<Controller["getState"]> = { blocks: [] };

    let block: ReturnType<Controller["getState"]>["blocks"][number] | undefined;
    let createNewBlock = true;

    for (let i = 0; i < state.heap.length; i++) {
      // The first 2 cells are reserved by the simulator, and should be in their
      // own group:
      // 0. The null pointer
      // 1. The free list pointer
      if (createNewBlock || i === 2) {
        if (block !== undefined) {
          result.blocks.push(block);
        }

        block = { cells: [], isAllocated: i < 2 };
      }

      block!.cells.push({
        value: state.heap[i],
        index: i,
        isAllocated: false,
        isReserved: i < 2,
      });

      createNewBlock = false; // TODO - We'll need to eventually read the free list to know when to create a new block
    }

    if (block !== undefined) {
      result.blocks.push(block);
    }

    return result;
  }
}

const controller = new Controller();

export default controller;
