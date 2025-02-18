import { makeAutoObservable } from "mobx";

class State {
  memorySize: number = 256;
  heap: { isAllocated: boolean; isReserved: boolean; value: number }[] = [];

  constructor() {
    makeAutoObservable(this);
  }
}

const state = new State();

export default state;
