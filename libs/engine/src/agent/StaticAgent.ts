/* eslint-disable @typescript-eslint/no-unused-vars */
import { Agent } from './Agent';


export class StaticAgent extends Agent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(public choices: any[]) {
    super();
  }

  override chooseNumber(min: number, max: number): number {
    return this.choices.pop();
  }
}
