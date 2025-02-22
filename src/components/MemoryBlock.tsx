import MemoryCell from "./MemoryCell.tsx";

const MemoryBlock = (props: {
  blockState: {
    cells: { index: number; isAllocated: boolean; isReserved: boolean; error: boolean; }[];
  };
}) => {
  return (
    <span className="memory-block-container">
      {props.blockState.cells.map((cell, index) => {
        return <MemoryCell key={index} cellState={cell} />;
      })}
    </span>
  );
};

export default MemoryBlock;
