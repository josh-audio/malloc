import { useState } from "react";
import CommandInput from "./CommandInput.tsx";
import CommandHistory from "./CommandHistory.tsx";

function CommandArea(props: {
  commandHistory: { style: string; text: string }[];
  getPrediction: (command: string) => string;
  onCommand: (command: string) => void;
  height: number;
}) {
  const [height, setHeight] = useState(200);

  if (height !== props.height) {
    setHeight(props.height);
  }

  // Styles:
  //  - command (for actual commands)
  //  - error (syntax or runtime errors)
  //  - info (non-error feedback)
  // const pushToHistory = (payload, style) => {
  //     let newHistoryItem = {};
  //     newHistoryItem.style = style;
  //     newHistoryItem.text = payload;
  //     setCommandHistory([...commandHistory, newHistoryItem]);
  // }

  return (
    <div
      className="command-area"
      style={{
        height: height,
      }}
    >
      <CommandHistory history={props.commandHistory} />
      <CommandInput
        getPrediction={props.getPrediction}
        onCommand={(command) => props.onCommand(command)}
      />
    </div>
  );
}

export default CommandArea;
