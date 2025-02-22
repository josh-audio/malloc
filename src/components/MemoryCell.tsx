import { observer } from "mobx-react";
import state from "../state/state";

const MemoryCell = observer(
  (props: {
    cellState: { index: number; isAllocated: boolean; isReserved: boolean; error: boolean; };
  }) => {
    const base = state.displayBase;

    let address = props.cellState.index.toString(base).toUpperCase();
    if (base === 16) {
      address = address.padStart(2, "0");
    }

    let value = state.heap[props.cellState.index].toString(base).toUpperCase();
    if (base === 16) {
      value = value.padStart(2, "0");
    }

    return (
      <div
        className={
          "cell-container" +
          (props.cellState.isAllocated ? " allocated" : " unallocated") +
          (props.cellState.isReserved ? " reserved" : " unreserved") + 
          (props.cellState.error ? " error" : "")
        }
      >
        <div className="memory-value">{value}</div>
        <div className={"memory-address-parent"}>
          <div className={"memory-address"}>{address}</div>
        </div>
      </div>
    );
  }
);

export default MemoryCell;
