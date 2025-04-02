import nearley from "nearley";
import state, { CommandHistoryItem } from "../state/state";
import engine from "./runtime/engine";
import grammar from "./grammar";
import statementSchema from "./grammar_output_validator";
import { getFreeList } from "./runtime/malloc_impl";

class Controller {
  getPrediction(input: string): string {
    const spaceSplit = input.split(" ");
    const spaceLastWord = spaceSplit[spaceSplit.length - 1];

    const parenthesisSplit = input.split("(");
    const parenthesisLastWord = parenthesisSplit[parenthesisSplit.length - 1];

    if (spaceLastWord === "" || parenthesisLastWord === "") {
      return input;
    }

    let predictions = Object.keys({
      ...engine.staticGlobalScope,
      ...engine.dynamicGlobalScope,
    })
      .map((identifier) => {
        const value = engine.getFromScope(identifier)!.value;

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
      })
      // This is bad, and part of a workaround for the fact that the parser can't
      // distinguish between "true" as a literal and "true" as an identifier. See
      // the definition of true and false in engine.ts for more.
      .filter((prediction) => prediction !== "false" && prediction !== "true");

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
        if (parser.results.length < 1) {
          console.log(parser.results);
          throw new Error("Internal error: Unexpected parser output.");
        }

        const validatedList = parser.results.map((result) =>
          statementSchema.parse(result)
        );
        let validated = validatedList[0];

        // This is a hack to make sure sizeof(int), which is ambiguous, is
        // always parsed as functionCall(type) and not functionCall(identifier)
        if (validatedList.length > 1) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const hasSizeOfIdentifier = (node: any) => {
            if (node.nodeType === "functionCall") {
              if (node.functionName.identifier === "sizeof") {
                if (node.arguments.length === 1) {
                  if (node.arguments[0].nodeType === "identifier") {
                    return true;
                  } else {
                    return false;
                  }
                }
              }

              for (const arg of node.arguments) {
                if (hasSizeOfIdentifier(arg)) {
                  return true;
                }
              }

              return false;
            } else {
              for (const key in node) {
                if (typeof node[key] === "object") {
                  if (hasSizeOfIdentifier(node[key])) {
                    return true;
                  }
                }
              }

              return false;
            }
          };

          validated =
            validatedList.find((result) => !hasSizeOfIdentifier(result)) ??
            validatedList[0];
        }

        const result = engine.evaluate(validated);

        let outputResult: string | undefined;

        if (result.nodeType === "void") {
          historyToAdd.push({
            style: "info",
            text: `-> void`,
          });
        } else if (
          (result.nodeType === "untypedRuntimeValue" ||
            result.nodeType === "typedRuntimeValue") &&
          result.value.nodeType === "literal"
        ) {
          if (result.value.literal.nodeType === "integer") {
            outputResult = result.value.literal.value.toString();
          } else if (result.value.literal.nodeType === "string") {
            outputResult = `"${result.value.literal.value}"`;
          } else if (result.value.literal.nodeType === "double") {
            outputResult = result.value.literal.value.toString();
          } else if (result.value.literal.nodeType === "boolean") {
            outputResult = result.value.literal.value.toString();
          }

          historyToAdd.push({
            style: "info",
            text: `-> ${outputResult}`,
          });
        }
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
    isAllocated: boolean;
    isReserved: boolean;
    value: number;
    error: boolean;
    index: number;
  }[][] {
    let blockIndexCounter = 0;

    const freeList = getFreeList();

    // List of cells with no grouping. They will be grouped together in the end.
    const cellList = state.heap.map((cell, index) => {
      if (index < 3) {
        return {
          isAllocated: false,
          isReserved: true,
          value: cell,
          index: -2,
          error: false,
        };
      }

      return {
        // After adding all free list entries, we will go through and find items
        // that still have this flag, and treat them as allocated.
        //
        // If the memory corrupts then this will completely break, but all sorts
        // of things will break if the memory is corrupted and that's sort of
        // the point.
        isAllocated: true,
        isReserved: false,
        value: cell,
        index: -1,
        error: false,
      };
    });

    // Write free list entries
    for (const freeListItem of freeList) {
      const err =
        freeListItem.sizeWithHeader < 3 ||
        freeListItem.ptr - 2 + freeListItem.sizeWithHeader > cellList.length;

      let writeCount = 0;
      for (
        let i = freeListItem.ptr - 2;
        i < freeListItem.ptr - 2 + freeListItem.sizeWithHeader &&
        i < cellList.length;
        i++
      ) {
        cellList[i].isAllocated = false;
        cellList[i].isReserved = writeCount < 2;
        cellList[i].value = state.heap[i];
        cellList[i].index = blockIndexCounter;
        cellList[i].error = err;

        writeCount++;
      }

      blockIndexCounter++;
    }

    const blocks: ReturnType<Controller["getState"]> = [
      [
        {
          isAllocated: false,
          isReserved: true,
          value: state.heap[0],
          index: 0,
          error: false,
        },
        {
          isAllocated: false,
          isReserved: true,
          value: state.heap[1],
          index: 1,
          error: false,
        },
        {
          isAllocated: false,
          isReserved: true,
          value: state.heap[2],
          index: 2,
          error: false,
        },
      ],
    ];

    let currentBlock: {
      isAllocated: boolean;
      isReserved: boolean;
      value: number;
      error: boolean;
      index: number;
    }[] = [];

    const startNewBlock = () => {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock);
      }

      currentBlock = [];
    };

    const addCellToBlock = (cell: (typeof cellList)[0], i: number) => {
      currentBlock.push({
        isAllocated: cell.isAllocated,
        isReserved: cell.isReserved || currentBlock.length < 2,
        value: cell.value,
        error: cell.error,
        index: i,
      });
    };

    let stateMachine: "unknown" | "free" | "allocated" = "unknown";
    let remainingCells = 0;
    let checkMagicNumber = false;
    for (let i = 3; i < cellList.length; i++) {
      const cell = cellList[i];

      let checkMagicNumberNext = false;

      if (stateMachine === "unknown") {
        if (cell.isAllocated) {
          stateMachine = "allocated";
          checkMagicNumberNext = true;
        } else {
          stateMachine = "free";
        }
        remainingCells = Math.max(cell.value - 1, 0);

        addCellToBlock(cell, i);

        continue;
      }

      if (remainingCells === 0) {
        startNewBlock();
        stateMachine = "unknown";
        checkMagicNumber = false;
        checkMagicNumberNext = false;
        i--; // Re-process this cell
        continue;
      }

      if (stateMachine === "free" && cell.isAllocated) {
        stateMachine = "allocated";

        // If we reached here before the end of the block, we need to start a
        // new block, but the last block's size was invalid
        cell.error = true;

        startNewBlock();

        remainingCells = Math.max(cell.value - 1, 0);
        checkMagicNumber = false;
        checkMagicNumberNext = true;

        addCellToBlock(cell, i);

        continue;
      } else if (stateMachine === "allocated" && !cell.isAllocated) {
        stateMachine = "free";
        cell.error = true;

        startNewBlock();

        remainingCells = cell.value;
        checkMagicNumber = false;
        checkMagicNumberNext = true;

        addCellToBlock(cell, i);

        continue;
      }

      if (checkMagicNumberNext) {
        checkMagicNumber = true;
        checkMagicNumberNext = false;
      } else if (checkMagicNumber) {
        if (cell.value !== 0xab) {
          cell.error = true;
        }
        checkMagicNumber = false;
      }

      addCellToBlock(cell, i);

      remainingCells--;
    }

    // Adds the last block
    startNewBlock();

    // Collapse single-element blocks
    let lastWasSingle = false;
    let i = 0;
    const blockGroups = blocks.map((item) => {
      if (item.length === 1) {
        if (!lastWasSingle) {
          i++;
        }

        lastWasSingle = true;

        // !!! This mutates the item!
        //
        // We don't want to report single-element blocks as reserved or
        // allocated, because they don't represent a valid allocation or a valid
        // free list entry.
        item[0].isReserved = false;
        item[0].isAllocated = false;

        return i;
      }

      lastWasSingle = false;
      i++;
      return i;
    });

    const collapsedBlocks = blockGroups.reduce((acc, cur, index) => {
      if (acc[cur] === undefined) {
        acc[cur] = [];
      }

      acc[cur].push(...blocks[index]);
      return acc;
    }, [] as ReturnType<Controller["getState"]>);

    return collapsedBlocks;
  }
}

const controller = new Controller();

export default controller;
