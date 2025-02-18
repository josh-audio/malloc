import React from "react";
import MemoryBlock from "./MemoryBlock.js";

function MemoryVisualizer(
  props: {
    memState: {
      blocks: {
        cells: { index: number; isAllocated: boolean; isReserved: boolean }[];
      }[];
    };
  } & React.HTMLAttributes<HTMLDivElement>
) {
  return (
    <div className="memory-container">
      {props.memState.blocks.map((elem, index) => {
        return <MemoryBlock key={index} blockState={elem} />;
      })}
    </div>
  );
}

export default MemoryVisualizer;
