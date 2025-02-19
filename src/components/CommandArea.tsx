import CommandInput from "./CommandInput.tsx";
import CommandHistory from "./CommandHistory.tsx";
import { observer } from "mobx-react";

const CommandArea = observer(
  (props: {
    height: number;
  }) => {
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
          height: props.height,
        }}
      >
        <CommandHistory />
        <CommandInput />
      </div>
    );
  }
);

export default CommandArea;
