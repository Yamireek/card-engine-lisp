/* eslint-disable @typescript-eslint/no-unused-vars */
import { Agent, ChooseItemsParams } from './Agent';

export class InterpretedAgent extends Agent {
  chooseItems<T>(params: ChooseItemsParams<T>): T[] {
    throw new Error('Method not implemented.');
  }
}
