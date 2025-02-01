import { CardId, PlayerId, Tokens, ZoneId } from '../entity/types';
import { Env, Instruction, Value } from '../types';
import { GameZoneType, PlayerZoneType, Side, ZoneType } from './enums';
import { CardDefinition, CardRef, Effect } from './GameSetupData';

export type State = {
  game: GameState;
  stack: Value[];
  frames: Env[];
  instructions: Instruction[];
};

export type CardState = {
  id: CardId;
  ref: CardRef;
  up: Side;
  token: Tokens;
};

export type PlayerState = {
  id: PlayerId;
};

export type ZoneState = {
  id: ZoneId;
  type: ZoneType;
  cards: CardId[];
  owner?: PlayerId;
};

export type GameState = {
  nextId: number;
  players: PlayerState[];
  zones: ZoneState[];
  cards: CardState[];
  effects: string[];
};
