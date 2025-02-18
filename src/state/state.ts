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
  memorySize: number = 256;
  heap: { isAllocated: boolean; isReserved: boolean; value: number }[] = [];

  commandHistory: { style: string; text: string }[] = getDefaultCommandHistory();

  resetCommandHistory() {
    this.commandHistory = getDefaultCommandHistory();
  }

  constructor() {
    makeAutoObservable(this);
  }
}

const state = new State();

export default state;
