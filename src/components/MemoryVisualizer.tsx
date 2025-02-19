import { observer } from "mobx-react";
import controller from "../core/controller";
import MemoryBlock from "./MemoryBlock";

const MemoryVisualizer = observer(() => {
  const memoryState = controller.getState();

  return (
    <div className="memory-container">
      {memoryState.blocks.map((elem, index) => {
        return <MemoryBlock key={index} blockState={elem} />;
      })}
    </div>
  );
});

export default MemoryVisualizer;
