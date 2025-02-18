import { useState } from "react";
import "./App.css";
import CommandArea from "./components/CommandArea.tsx";
import MemoryVisualizer from "./components/MemoryVisualizer.tsx";
import nearley from "nearley";
import engine from "./core/engine.ts";
import Grammar from "./core/grammar.ts";
import state from "./state/state.ts";
import { observer } from "mobx-react";

const App = observer(() => {
  const [commandHeight, setCommandHeight] = useState(500);
  const [isDragActive, setIsDragActive] = useState(false);
  const [commandHistory, setCommandHistory] = useState<
    { style: string; text: string }[]
  >([]);
  const [uiState, setUiState] = useState(engine.getState());

  if (commandHistory.length === 0) {
    setCommandHistory([
      {
        style: "info",
        text: "-> Type help() for usage.",
      },
    ]);
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragActive) {
      return;
    }

    const pageHeight = document.querySelector("body")!.clientHeight;

    let newHeight = pageHeight - event.pageY;
    if (newHeight < 250) {
      newHeight = 250;
    } else if (newHeight > (pageHeight * 4) / 7) {
      newHeight = (pageHeight * 4) / 7;
    }
    newHeight -= 3; // Account for spacer height
    setCommandHeight(newHeight);
  };

  return (
    <div
      className="App"
      style={{
        cursor: isDragActive ? "ns-resize" : undefined,
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={() => {
        setIsDragActive(false);
      }}
    >
      {state.heap.filter((elem) => elem.isAllocated).length}
      <div className="mainContent" style={{ flex: 1 }}>
        <MemoryVisualizer memState={uiState} />
      </div>
      <div
        className="spacer"
        onMouseDown={() => {
          setIsDragActive(true);
        }}
        style={{
          height: 6,
        }}
      />
      <CommandArea
        height={commandHeight}
        commandHistory={commandHistory}
        getPrediction={(text: string): string => {
          const spaceSplit = text.split(" ");
          const spaceLastWord = spaceSplit[spaceSplit.length - 1];

          const parenthesisSplit = text.split("(");
          const parenthesisLastWord =
            parenthesisSplit[parenthesisSplit.length - 1];

          if (spaceLastWord === "" || parenthesisLastWord === "") {
            return text;
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
            "setMemorySize",
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

          return text;
        }}
        onCommand={(command: string) => {
          const historyToAdd = [];

          historyToAdd.push({
            style: "command",
            text: command,
          });

          // Grammar is imported from core/grammar.js
          const parser = new nearley.Parser(
            nearley.Grammar.fromCompiled(Grammar)
          );

          let syntaxError = false;

          try {
            parser.feed(command.trim());
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
              const result = engine.evaluate(parser.results);

              let outputResult: string | undefined;

              setUiState(engine.getState());

              if (result !== undefined && result.toString() !== "") {
                if (result.nodeType === "variable") {
                  if (result.type !== "void") {
                    outputResult = result.value.toString();
                  }
                } else if (result.nodeType === "type") {
                  outputResult = result.type;
                } else if (result.nodeType === "action") {
                  if (result.action === "clearConsole") {
                    setCommandHistory([]);
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

          setCommandHistory([...commandHistory, ...historyToAdd]);
        }}
      />
    </div>
  );
});

export default App;
