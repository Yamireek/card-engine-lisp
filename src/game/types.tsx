import { Texture } from 'three';
import { Difficulty } from '@card-engine-lisp/engine';
import { core, decks } from '@card-engine-lisp/cards';

export type NewGameParams = {
  type: 'new';
  server?: 'local' | { url: string };
  playerCount: '1' | '2' | '3' | '4';
  players: Array<keyof typeof decks>;
  scenario: keyof typeof core.scenario;
  difficulty: Difficulty;
  extra: {
    resources: number;
    cards: number;
  };
};

export type LoadGameParams = {
  type: 'load';
  state: string;
};

export type JoinGameParams = {
  type: 'join';
  server: string;
  playerID: string;
  matchID: string;
  credentials: string;
};

export type SetupParams = NewGameParams | LoadGameParams | JoinGameParams;

export type Vector2 = [number, number];

export type Vector3 = [number, number, number];

export type CardTexture = Texture | { front: Texture; back: Texture };

export type Dimensions = { width: number; height: number };

export type Dimensions3 = { width: number; height: number; thick: number };
