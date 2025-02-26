import CommandInput from "./CommandInput.tsx";
import CommandHistory from "./CommandHistory.tsx";
import { observer } from "mobx-react";

const CommandArea = observer((props: { height: number }) => {
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
});

export default CommandArea;
