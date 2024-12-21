import { GameState } from '../entity';
import { Env, Instruction, Value } from '../types';

export type State = {
  game: GameState;
  stack: Value[];
  vars: Env;
  instructions: Instruction[];
};
