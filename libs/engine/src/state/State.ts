import { CardId, CardProps, Tokens } from '../entity/types';
import { Env, Instruction, Value } from '../types';

export type State = {
  game: GameState;
  stack: Value[];
  vars: Env;
  instructions: Instruction[];
};

export type CardState = {
  id: CardId;
  props: CardProps;
  tokens: Tokens;
};

export type GameState = {
  nextId: number;
  card: Record<CardId, CardState>;
};
