import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { uniqueId } from "lodash";
import controller from "../core/controller";

function CommandInput() {
  const [id] = useState(uniqueId("command-input-"));

  const [text, setText] = useState("");
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  // -1 represents a new input
  const [historyIdx, setHistoryIdx] = useState(-1);

  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (historyIdx !== -1) {
      const el = document.getElementById(id)! as HTMLInputElement;
      el.selectionStart = el.selectionEnd = el.value.length;
    }
  }, [historyIdx, id]);

  return (
    <div className="command-input-container">
      {/* TODO: animate */}
      <div
        className={`command-input-arrow ${
          isFocused || isHovered ? "focused" : ""
        }`}
      >
        {">"}
      </div>
      <div
        className="command-input"
        onMouseEnter={() => {
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
      >
        <div className="code-render">
          <span style={{ opacity: 0.5 }}>
            <SyntaxHighlighter language="c" style={atomDark}>
              {controller.getPrediction(text)}
            </SyntaxHighlighter>
          </span>
        </div>
        <div className="code-render">
          <SyntaxHighlighter language="c" style={atomDark}>
            {text}
          </SyntaxHighlighter>
        </div>
        <input
          id={id}
          spellCheck="false"
          value={text}
          onChange={(e) => {
            const value = e.currentTarget.value;
            setText(value);
            setHistoryIdx(-1);
          }}
          onFocus={() => {
            setIsFocused(true);
          }}
          onBlur={() => {
            setIsFocused(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              e.preventDefault();
              const prediction = controller.getPrediction(text);
              setText(prediction);
            } else if (e.key === "Enter") {
              if (text === "") {
                return;
              }
              setInputHistory([...inputHistory, text]);
              controller.executeStatement(text);
              setText("");
              setHistoryIdx(-1);
            } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault();
              let newHistoryIdx = -1;
              if (e.key === "ArrowUp") {
                if (historyIdx === -1) {
                  if (inputHistory.length === 0) {
                    return;
                  }
                  newHistoryIdx = inputHistory.length - 1;
                  setHistoryIdx(newHistoryIdx);
                } else if (historyIdx === 0) {
                  return;
                } else {
                  newHistoryIdx = historyIdx - 1;
                  setHistoryIdx(newHistoryIdx);
                }
              } else if (e.key === "ArrowDown") {
                if (historyIdx === -1) {
                  return;
                } else if (historyIdx === inputHistory.length - 1) {
                  newHistoryIdx = -1;
                  setHistoryIdx(newHistoryIdx);
                } else {
                  newHistoryIdx = historyIdx + 1;
                  setHistoryIdx(newHistoryIdx);
                }
              }

              if (newHistoryIdx !== -1) {
                const newValue = inputHistory[newHistoryIdx];
                setText(newValue);
              } else {
                setText("");
              }
            }
          }}
        />
      </div>
    </div>
  );
}

export default CommandInput;
