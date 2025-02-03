/* eslint-disable @typescript-eslint/no-explicit-any */
import { GameState } from '.';
import { Card, Game, Player, PlayerId, Zone } from '../entity';
import { Flavor } from '../types';
import { Difficulty, Orientation } from './enums';
import { PrintedProps } from './PrintedProps';

export type Modifier = (props: CardProps) => void;

export type Ability = {
  description: string;
  code: (self: Card) => Effect;
};

export type EntityFilter<N, T> =
  | 'ALL'
  | Flavor<number | string, N>
  | ((entity: T) => boolean);

export type MethodNames<E> = {
  [K in keyof E]: E[K] extends (...args: any[]) => any ? K : never;
}[keyof E];

export type CallEntity<E> = MethodNames<E> extends infer M
  ? M extends MethodNames<E>
    ? E[M] extends (...args: any[]) => any
      ? ['CALL', M, ...Parameters<E[M]>]
      : never
    : never
  : never;

export type EntityMethod<E, Args extends any[]> = (...args: Args) => {
  isAllowed?: () => boolean;
  body: EntityAction<E> | (() => void);
};

export type EntityAction<T> =
  | CallEntity<T>
  | ['SEQ', ...EntityAction<T>[]]
  | Action;

export type ChoiceOptions = {
  player: PlayerId;
  label: string;
  min?: number;
  max?: number;
};

export type Action =
  | ['GAME', EntityAction<Game>]
  | ['ZONE', EntityAction<Zone>]
  | ['PLAYER', EntityAction<Player>]
  | ['CARD', EntityFilter<'card', Card>, EntityAction<Card>]
  | [
      'CHOOSE',
      'CARD',
      EntityFilter<'card', Card>,
      ChoiceOptions,
      EntityAction<Card>
    ]
  | [
      'CHOOSE',
      'PLAYER',
      EntityFilter<'player', Player>,
      ChoiceOptions,
      EntityAction<Player>
    ]
  | ['CHOOSE', 'ACTION', ChoiceOptions, Array<[string, Action]>];

export type Effect = {
  type: 'card';
  target: EntityFilter<'card', Card>;
  modifier: (card: Card) => (props: CardProps) => void;
};

export type CardRef = `${string}/${number}`;

export type CardProps = PrintedProps & { abilities: Array<Ability> };

export type CardDefinition = {
  front: CardProps;
  back: CardProps;
  orientation: Orientation;
};

export type EncounterSet = {
  easy: CardRef[];
  normal: CardRef[];
};

export type PlayerDeck = {
  name: string;
  heroes: CardRef[];
  library: CardRef[];
};

export type Scenario = {
  name: string;
  quest: CardRef[];
  sets: EncounterSet[];
};

export type ScenarioSetupData = {
  type: 'scenario';
  data: ScenarioSetup;
};

export type JSONSetupData = { type: 'json'; data: GameState };

export type GameSetupData = ScenarioSetupData | JSONSetupData;

export type ScenarioSetup = {
  players: PlayerDeck[];
  scenario: Scenario;
  difficulty: Difficulty;
  extra: {
    resources: number;
    cards: number;
  };
};
