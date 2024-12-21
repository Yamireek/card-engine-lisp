import { Flavor, Instruction, Value } from '../types';

export type CardId = Flavor<number, 'card'>;

export type CardType = 'hero' | 'ally' | 'enemy';

export type CardProps = {
  name: string;
  type: CardType;
  att: number;
  def: number;
};

export type Token = 'damage' | 'progress' | 'resource';

export type Tokens = Record<Token, number>;

export type CardState = {
  id: CardId;
  props: CardProps;
  tokens: Tokens;
};

export type GameState = {
  nextId: number;
  card: Record<CardId, CardState>;
};

export type State = {
  game: GameState;
  stack: Value[];
  instructions: Instruction[];
};
