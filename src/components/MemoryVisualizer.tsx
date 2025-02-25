import { observer } from "mobx-react";
import controller from "../core/controller";
import MemoryCell from "./MemoryCell";

const MemoryVisualizer = observer(() => {
  const memoryState = controller.getState();

  return (
    <div className="memory-container">
      {memoryState.map((block) => {
        return block.map((cell, cellIndex) => (
          <MemoryCell
            key={cell.index}
            cellState={cell}
            blockStart={cellIndex === 0}
            blockEnd={cellIndex === block.length - 1}
          />
        ));
      })
      // .flat() is used to flatten the array of arrays
      //
      // Without this, React will not persist the cells in DOM when they move
      // between groups, and the animation will not work as expected
      .flat()}
    </div>
  );
});

export default MemoryVisualizer;
