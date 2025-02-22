import { observer } from "mobx-react";
import controller from "../core/controller";
import MemoryCell from "./MemoryCell";

const MemoryVisualizer = observer(() => {
  const memoryState = controller.getState();

  return (
    <div className="memory-container">
      {memoryState.map((block, blockIndex) => {
        return block.cells.map((cell, cellIndex) => (
          <MemoryCell
            key={`${blockIndex}-${cellIndex}`}
            cellState={cell}
            blockStart={cellIndex === 0}
            blockEnd={cellIndex === block.cells.length - 1}
          />
        ));
      })}
    </div>
  );
});

export default MemoryVisualizer;
