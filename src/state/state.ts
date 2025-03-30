import { makeAutoObservable } from "mobx";
import { initMemory } from "../core/runtime/malloc_impl";

import {
  BEST_FIT,
  FIRST_FIT,
  NEXT_FIT,
  WORST_FIT,
} from "../core/runtime/malloc_impl";

type CommandHistoryItem = {
  style: "command" | "error" | "info";
  text: string;
};

function getDefaultCommandHistory(): CommandHistoryItem[] {
  return [
    {
      style: "info",
      text: "-> Type help() for usage.",
    },
  ];
}

class State {
  displayBase: 10 | 16 = 10;
  memoryAllocationStrategy:
    | typeof FIRST_FIT
    | typeof NEXT_FIT
    | typeof BEST_FIT
    | typeof WORST_FIT = FIRST_FIT;

  memorySize: number = 256;
  heap: number[] = [];

  // Styles:
  //  - command (for actual commands)
  //  - error (syntax or runtime errors)
  //  - info (non-error feedback)
  commandHistory: CommandHistoryItem[] = getDefaultCommandHistory();

  resetCommandHistory() {
    this.commandHistory = getDefaultCommandHistory();
  }

  constructor() {
    Promise.resolve().then(() => {
      initMemory();
    });

    makeAutoObservable(this);
  }

  // Saves the memory array to the local storage
  save(key: string): void {
    localStorage.setItem(key, JSON.stringify(this.heap));
  }

  // Loads the memory array from the local storage
  load(key: string): void {
    const data = localStorage.getItem(key);
    if (data) {
      this.heap = JSON.parse(data);
    } else {
      throw new Error("No data found in local storage for the given key.");
    }
  }
}

const state = new State();

export default state;
export type { CommandHistoryItem };
