import { useState } from "react";
import "./App.css";
import CommandArea from "./components/CommandArea.tsx";
import MemoryVisualizer from "./components/MemoryVisualizer.tsx";
import state from "./state/state.ts";
import { observer } from "mobx-react";

const App = observer(() => {
  const [commandHeight, setCommandHeight] = useState(300);
  const [isDragActive, setIsDragActive] = useState(false);

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
        <MemoryVisualizer />
      </div>
      <div
        className="spacer"
        onMouseDown={() => {
          setIsDragActive(true);
        }}
        style={{
          height: 4,
        }}
      />
      <CommandArea height={commandHeight} />
    </div>
  );
});

export default App;
