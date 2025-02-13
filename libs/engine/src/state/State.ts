import { Limits } from '../entity';
import { CardId, PlayerId, Tokens, ZoneId } from '../entity/types';
import { Side, ZoneType } from './enums';
import { CardRef } from './GameSetupData';

export type State = {
  game: GameState;
  stack: string[];
};

export type CardState = {
  id: CardId;
  zoneId: ZoneId;
  ref: CardRef;
  up: Side;
  token: Tokens;
};

export type PlayerState = {
  id: PlayerId;
  threat: number;
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
  triggers: string;
  limits: Limits;
};
