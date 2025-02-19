import nearley from "nearley";
import state from "../state/state";
import engine from "./engine";
import grammar from "./grammar";
import statementSchema from "./grammar_output_validator";

class Controller {
  getPrediction(input: string): string {
    const spaceSplit = input.split(" ");
    const spaceLastWord = spaceSplit[spaceSplit.length - 1];

    const parenthesisSplit = input.split("(");
    const parenthesisLastWord =
      parenthesisSplit[parenthesisSplit.length - 1];

    if (spaceLastWord === "" || parenthesisLastWord === "") {
      return input;
    }

    const zeroArgumentFunctions = [
      "help",
      "reset",
      "clearConsole",
      "coalesce",
      "getAllocationMethod",
      "freeAll",
    ];
    const oneArgumentFunctions = [
      "malloc",
      "free",
      "sizeof",
      "setAllocationMethod",
    ];

    const identifiers = engine.getIdentifiers();
    const functions = engine.getFunctions();

    let predictions = oneArgumentFunctions
      .map((elem) => elem + "(")
      .concat(zeroArgumentFunctions.map((elem) => elem + "()"))
      .concat(
        identifiers.filter(
          (identifier) => !functions.includes(identifier)
        )
      );

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
    const historyToAdd = [];

    historyToAdd.push({
      style: "command",
      text: statement,
    });

    const parser = new nearley.Parser(
      nearley.Grammar.fromCompiled(grammar)
    );

    let syntaxError = false;

    try {
      parser.feed(statement.trim());
    } catch (ex) {
      if (!(ex instanceof Error)) {
        throw ex;
      }

      syntaxError = true;
      historyToAdd.push({
        style: "error",
        text: ex.message
          .slice(0, ex.message.search("Instead, "))
          .replace(/line [0-9]+ /, ""),
      });
    }

    if (!syntaxError) {
      try {
        if (parser.results.length !== 1) {
          throw new Error("Internal error: Unexpected parser output.");
        }

        const validated = statementSchema.parse(parser.results[0]);

        const result = engine.evaluate(validated);

        let outputResult: string | undefined;

        if (result !== undefined && result.toString() !== "") {
          if (result.nodeType === "variable") {
            if (result.type !== "void") {
              outputResult = result.value.toString();
            }
          } else if (result.nodeType === "type") {
            outputResult = result.type;
          } else if (result.nodeType === "action") {
            if (result.action === "clearConsole") {
              state.resetCommandHistory();
              return;
            } else {
              throw new Error("Internal error: Unsupported UI action.");
            }
          }
        }

        if (result === undefined) {
          outputResult = "void";
        }

        historyToAdd.push({
          style: "info",
          text: `-> ${outputResult}`,
        });
      } catch (ex) {
        if (!(ex instanceof Error)) {
          throw ex;
        }

        historyToAdd.push({
          style: "error",
          text: ex.message,
        });
      }
    }

    for (const historyItem of historyToAdd) {
      state.commandHistory.push(historyItem);
    }
  }
}

const controller = new Controller();

export default controller;
