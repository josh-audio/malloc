import { makeAutoObservable } from "mobx";

class State {
  someString: string = 'red';

  constructor() {
    makeAutoObservable(this);
  }
}

const state = new State();

export default state;
