import { Agent } from './Agent';

export class StaticAgent extends Agent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(public choices: any[]) {
    super();
  }

  chooseItems<T>(): T[] {
    return this.choices.shift();
  }
}
