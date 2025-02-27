import state from "../../state/state";
import { RuntimeValueNode } from "./engine";

const FIRST_FIT = 0;
const NEXT_FIT = 1;
const BEST_FIT = 2;
const WORST_FIT = 3;

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

const writeToHeap = (index: number, value: number) => {
  if (index >= state.heap.length || index < 0) {
    return;
  }

  state.heap[index] = Math.max(0, Math.min(value, 255));
};

const writeAllocatedBlockHeader = (index: number, size: number) => {
  writeToHeap(index, size);
  writeToHeap(index + 1, 0xab); // Allocated block marker - AKA "magic value" according to OSTEP
};

const writeFreeBlockHeader = (index: number, size: number, next: number) => {
  writeToHeap(index, size);
  writeToHeap(index + 1, next);
};

const mallocImpl = (args: RuntimeValueNode[]): RuntimeValueNode => {
  const sizeArg = args[0];

  if (sizeArg.nodeType !== "runtimeValue") {
    throw new Error(
      "Type error: Invalid type for malloc size. Expected runtimeValue, got " +
        sizeArg.nodeType
    );
  }

  if (sizeArg.type.type !== "int") {
    throw new Error(
      "Type error: Invalid type for malloc size. Expected int, got " +
        sizeArg.type.type
    );
  }

  if (sizeArg.value.nodeType !== "literal") {
    throw new Error(
      "Type error: Invalid type for malloc size. Expected literal, got " +
        sizeArg.value.nodeType
    );
  }

  if (sizeArg.value.literal.nodeType !== "int") {
    throw new Error(
      "Internal error: Mismatched literal type for malloc size. Expected int, got " +
        sizeArg.value.literal.nodeType
    );
  }

  const size = sizeArg.value.literal.int;

  const freeList = getFreeList();

  const sizeOfLargest = freeList.reduce((acc, block) => {
    if (block.size > acc) {
      return block.size;
    }
    return acc;
  }, 0);

  // We need two bytes for the block header
  if (size > sizeOfLargest - 2 || size == 0) {
    // Out of memory
    return {
      nodeType: "runtimeValue",
      type: {
        nodeType: "type",
        type: "void*",
      },
      value: {
        nodeType: "literal",
        literal: {
          nodeType: "char",
          char: 0, // Null pointer
        },
      },
    };
  }

  const sizeWithHeader = size + 2;

  const allocateAt = (
    i: number,
    updateNextFitPointer: boolean = false
  ): RuntimeValueNode => {
    const hasPrevious = i > 0;
    const hasNext = i + 1 < freeList.length;

    const block = freeList[i];

    const next = block.next;

    const newBlockStart = block.startIndex;

    let allocatedSize = size + 2;

    if (block.size - allocatedSize < 3) {
      // There's not enough space for a free block header plus at least one
      // byte of free space, so we will hand out the entire block
      allocatedSize = block.size;
    }

    const newBlockEnd = block.startIndex + allocatedSize;

    writeAllocatedBlockHeader(newBlockStart, allocatedSize);

    let newSplitFreeBlockIndex: number | undefined = undefined;

    // If we have enough space left over to create a new free block, we
    // need to split the block
    if (block.size - allocatedSize >= 3) {
      writeFreeBlockHeader(newBlockEnd, block.size - sizeWithHeader, next);
      newSplitFreeBlockIndex = newBlockEnd;
    }

    let nextFreeListEntryPtr = -1;

    // If we just filled the first block in the free list, we need to
    // update the free list pointer, since the free list pointer should
    // always point to the first block in the free list
    if (newSplitFreeBlockIndex !== undefined) {
      nextFreeListEntryPtr = newSplitFreeBlockIndex;
    } else if (hasNext) {
      nextFreeListEntryPtr = freeList[i + 1].startIndex;
    } else {
      // If we just filled the last block in the free list, we need to
      // update the free list pointer to 0
      nextFreeListEntryPtr = 0;
    }

    if (!hasPrevious) {
      writeToHeap(1, nextFreeListEntryPtr);
    } else {
      // We need to update the previous block's next pointer
      const prev = freeList[i - 1].startIndex;
      writeToHeap(prev + 1, nextFreeListEntryPtr);
    }

    if (updateNextFitPointer) {
      if (nextFreeListEntryPtr === 0) {
        const freeList = getFreeList();
        nextFreeListEntryPtr = freeList[0]?.startIndex ?? 0;
      }

      writeToHeap(2, nextFreeListEntryPtr);
    }

    return {
      nodeType: "runtimeValue",
      type: {
        nodeType: "type",
        type: "void*",
      },
      value: {
        nodeType: "literal",
        literal: {
          nodeType: "char",
          char: newBlockStart + 2, // Skip the block header
        },
      },
    };
  };

  if (state.memoryAllocationStrategy === FIRST_FIT) {
    for (let i = 0; i < freeList.length; i++) {
      const block = freeList[i];

      if (block.size >= sizeWithHeader) {
        return allocateAt(i);
      }
    }
  } else if (state.memoryAllocationStrategy === BEST_FIT) {
    let bestFitIndex = -1;
    let bestFitSize = Number.MAX_SAFE_INTEGER;

    for (let i = 0; i < freeList.length; i++) {
      const block = freeList[i];

      if (block.size >= sizeWithHeader && block.size < bestFitSize) {
        bestFitIndex = i;
        bestFitSize = block.size;
      }
    }

    if (bestFitIndex !== -1) {
      return allocateAt(bestFitIndex);
    }
  } else if (state.memoryAllocationStrategy === WORST_FIT) {
    let worstFitIndex = -1;
    let worstFitSize = 0;

    for (let i = 0; i < freeList.length; i++) {
      const block = freeList[i];

      if (block.size >= sizeWithHeader && block.size > worstFitSize) {
        worstFitIndex = i;
        worstFitSize = block.size;
      }
    }

    if (worstFitIndex !== -1) {
      return allocateAt(worstFitIndex);
    }
  } else if (state.memoryAllocationStrategy === NEXT_FIT) {
    let nextFitPointer = state.heap[2]; // Next fit pointer

    for (let i = 0; i < freeList.length; i++) {
      let blockIndex = -1;

      const block = freeList.find((b, i) => {
        blockIndex = i;
        return b.startIndex === nextFitPointer;
      });

      if (!block) {
        break;
      }

      if (block.size >= sizeWithHeader) {
        return allocateAt(blockIndex, true);
      }

      nextFitPointer = block.next;
      if (nextFitPointer === 0) {
        nextFitPointer = freeList[0].startIndex;
      }
    }
  }

  // If we get here, we didn't find a suitable block
  return {
    nodeType: "runtimeValue",
    type: {
      nodeType: "type",
      type: "void*",
    },
    value: {
      nodeType: "literal",
      literal: {
        nodeType: "char",
        char: 0, // Null pointer
      },
    },
  };
};

export {
  mallocImpl,
  initMemory,
  getFreeList,
  FIRST_FIT,
  NEXT_FIT,
  BEST_FIT,
  WORST_FIT,
};
