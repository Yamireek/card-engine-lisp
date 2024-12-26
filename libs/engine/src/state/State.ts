import { CardId, PlayerId, Tokens, ZoneId } from '../entity/types';
import { Env, Instruction, Value } from '../types';
import { GameZoneType, PlayerZoneType, Side, ZoneType } from './enums';
import { CardDefinition } from './GameSetupData';

export type State = {
  game: GameState;
  stack: Value[];
  frames: Env[];
  instructions: Instruction[];
};

export type CardState = {
  id: CardId;
  definition: CardDefinition;
  sideUp: Side;
  tokens: Tokens;
};

export type PlayerState = {
  id: PlayerId;
  zone: Record<PlayerZoneType, ZoneState>;
};

export type ZoneState = {
  id: ZoneId;
  type: ZoneType;
  cards: CardId[];
};

export type GameState = {
  nextId: number;
  card: Record<CardId, CardState>;
  player: Record<PlayerId, PlayerState>;
  zone: Record<GameZoneType, ZoneState>;
};
