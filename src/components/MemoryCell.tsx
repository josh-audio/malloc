function MemoryCell(props: {
  cellState: { index: number; isAllocated: boolean; isReserved: boolean };
}) {
  return (
    <div
      className={
        "cell-container" +
        (props.cellState.isAllocated ? " allocated" : " unallocated") +
        (props.cellState.isReserved ? " reserved" : " unreserved")
      }
    >
      {props.cellState.index.toString(16).padStart(2, "0").toUpperCase()}
    </div>
  );
}

export default MemoryCell;
