import { observer } from "mobx-react";
import state from "../state/state";
import { useEffect, useRef, useState } from "react";

const MemoryCell = observer(
  (props: {
    cellState: {
      index: number;
      isAllocated: boolean;
      isReserved: boolean;
      error: boolean;
    };
    blockStart: boolean;
    blockEnd: boolean;
  }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const [edit, setEdit] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const base = state.displayBase;

    let address = props.cellState.index.toString(base).toUpperCase();
    if (base === 16) {
      address = address.padStart(2, "0");
    }

    let value = state.heap[props.cellState.index].toString(base).toUpperCase();
    if (base === 16) {
      value = value.padStart(2, "0");
    }

    // Focus the input when it is shown
    useEffect(() => {
      if (inputRef.current?.style.display !== "none") {
        inputRef.current?.focus();
      }
    });

    return (
      <div
        className={
          "cell-container" +
          (props.cellState.isAllocated ? " allocated" : " unallocated") +
          (props.cellState.isReserved ? " reserved" : " unreserved") +
          (props.cellState.error ? " error" : "") + 
          (props.blockStart ? " block-start" : "") + 
          (props.blockEnd ? " block-end" : "")
        }
        onClick={() => {
          setEdit(true);
          setInputValue(value);
        }}
      >
        <div className="memory-value">{edit ? inputValue : value}</div>
        <div className={"memory-address-parent"}>
          <div className={"memory-address"}>{address}</div>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          style={{
            display: edit ? undefined : "none",
          }}
          onChange={(e) => {
            setInputValue(e.target.value);

            const newValue = Math.max(
              Math.min(parseInt(e.target.value, base), 255),
              0
            );

            if (isNaN(newValue)) {
              return;
            }

            state.heap[props.cellState.index] = newValue;
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              setEdit(false);
            }
          }}
          onBlur={() => {
            setEdit(false);
          }}
        />
      </div>
    );
  }
);

export default MemoryCell;
