import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function insertNewlines(text: string) {
  return text
    .replace(/ /g, " ")
    .split("\n")
    .map(function (item, key) {
      return (
        <span key={key}>
          {item}
          <br />
        </span>
      );
    });
}

function HistoryItem(props: {
  historyItem: { style: string; text: string };
  index: number;
}) {
  return (
    // <animated.div style={{marginLeft: marginLeft, opacity: opacity}} className={`command-history-item ${props.historyItem.style}`}>
    <div className={`command-history-item ${props.historyItem.style}`}>
      {props.historyItem.style !== "command" ? (
        insertNewlines(props.historyItem.text)
      ) : (
        <div className="code-render">
          <SyntaxHighlighter language="c" style={atomDark}>
            {props.historyItem.text}
          </SyntaxHighlighter>
        </div>
      )}
      {/* </animated.div> */}
    </div>
  );
}

function CommandHistory(props: {
  history: { style: string; text: string }[];
}) {
  const [historySize, setHistorySize] = useState(0);

  useEffect(() => {
    if (historySize !== props.history.length) {
      setHistorySize(props.history.length);
      const scrollArea = document.querySelector(".command-history-container")!;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [historySize, props.history.length]);

  return (
    <div className="command-history-container">
      {props.history.map((historyItem, index) => (
        <HistoryItem key={index} historyItem={historyItem} index={index} />
      ))}
    </div>
  );
}

export default CommandHistory;
