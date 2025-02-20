import { makeAutoObservable } from "mobx";

function getDefaultCommandHistory() {
  return [
    {
      style: "info",
      text: "-> Type help() for usage.",
    },
  ];
}

class State {
  displayBase: 10 | 16 = 16;

  memorySize: number = 256;
  heap: { isAllocated: boolean; isReserved: boolean; value: number }[] = [];

  commandHistory: { style: string; text: string }[] = getDefaultCommandHistory();

  resetCommandHistory() {
    this.commandHistory = getDefaultCommandHistory();
  }

  constructor() {
    for (let i = 0; i < this.memorySize; i++) {
      this.heap.push({
        isAllocated: false,
        isReserved: false,
        value: 0,
      });
    }

    makeAutoObservable(this);
  }
}

const state = new State();

export default state;
