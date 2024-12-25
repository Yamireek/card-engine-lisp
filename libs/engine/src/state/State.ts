import { CardId, PlayerId, Tokens, ZoneId } from '../entity/types';
import { Env, Instruction, Value } from '../types';
import { GameZoneType, PlayerZoneType } from './enums';
import { CardDefinition } from './GameSetupData';

export type State = {
  game: GameState;
  stack: Value[];
  vars: Env;
  instructions: Instruction[];
};

export type CardState = {
  id: CardId;
  definition: CardDefinition;
  tokens: Tokens;
};

export type PlayerState = {
  id: PlayerId;
  zone: Record<PlayerZoneType, ZoneState>;
};

export type ZoneState = {
  id: ZoneId;
  cards: CardId[];
};

export type GameState = {
  nextId: number;
  card: Record<CardId, CardState>;
  player: Record<PlayerId, PlayerState>;
  zone: Record<GameZoneType, ZoneState>;
};
