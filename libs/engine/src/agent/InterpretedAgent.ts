/* eslint-disable @typescript-eslint/no-unused-vars */
import { Agent } from './Agent';


export class InterpretedAgent extends Agent {
  override chooseNumber(min: number, max: number): number {
    throw new Error('Method not implemented.');
  }
}
