import state from "../../state/state";
import { RuntimeValueNode, Scope } from "./engine";

const initMemory = () => {
  state.heap.splice(0, state.heap.length);
  for (let i = 0; i < 256; i++) {
    if (i === 0) {
      // Null pointer
      state.heap.push(0);
    } else if (i === 1) {
      // Free list pointer
      state.heap.push(3);
    } else if (i === 2) {
      // Next fit pointer
      state.heap.push(0);
    } else if (i === 3) {
      // First emtpy block size
      state.heap.push(253);
    } else if (i === 4) {
      // First emtpy block next pointer
      state.heap.push(0);
    } else {
      state.heap.push(0);
    }
  }
};

const getFreeList = (): {
  startIndex: number;
  size: number;
  next: number;
  sizeError?: true;
  nextError?: true;
  regionError?: true;
}[] => {
  const freeList: ReturnType<typeof getFreeList> = [];

  let freeListPointer = state.heap[1];

  let iter = 0;
  while (freeListPointer !== 0) {
    if (iter > 255) {
      return [{ startIndex: 3, size: 253, next: 0, regionError: true }];
    }

    const size = state.heap[freeListPointer];
    const next = state.heap[freeListPointer + 1];

    freeList.push({ startIndex: freeListPointer, size, next });

    freeListPointer = next;

    iter++;
  }

  return freeList;
};

const mallocImpl = (
  scope: Scope,
  args: RuntimeValueNode[]
): RuntimeValueNode => {
  return {
    nodeType: "runtimeValue",
    type: {
      nodeType: "type",
      type: "void*",
    },
    value: {
      nodeType: "literal",
      literal: {
        nodeType: "string",
        string: `${scope["test"]} ${args.length}`,
      },
    },
  };
};

export { mallocImpl, initMemory, getFreeList };
