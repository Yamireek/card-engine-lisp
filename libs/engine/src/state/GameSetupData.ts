/* eslint-disable @typescript-eslint/no-explicit-any */
import { GameState } from '.';
import { Card, CardId, Game, Player, PlayerId, Zone, ZoneId } from '../entity';
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
  | Array<number | string>
  | ((entity: T) => boolean);

export type MethodNames<E> = {
  [K in keyof Omit<E, 'exe'>]: Omit<E, 'exe'>[K] extends (...args: any[]) => any
    ? K
    : never;
}[keyof Omit<E, 'exe'>];

export type CallEntity<E> = MethodNames<E> extends infer M
  ? M extends MethodNames<E>
    ? E[M] extends (...args: any[]) => any
      ? ['CALL', M, ...Parameters<E[M]>]
      : never
    : never
  : never;

export type EntityMethod<E, Args extends any[] = void[]> = (...args: Args) => {
  isAllowed?: () => boolean;
  body: EntityAction<E> | (() => void);
};

export type EntityAction<T> =
  | CallEntity<T>
  | ['SEQ', ...EntityAction<T>[]]
  | Action;

export type BaseChoiceOptions = {
  player: PlayerId;
  label: string;
  min?: number;
  max?: number;
};

export type CardChoiceOptions = BaseChoiceOptions & {
  type: 'card';
  filter: EntityFilter<'CARD', Card>;
  action: EntityAction<Card>;
};

export type PlayerChoiceOptions = BaseChoiceOptions & {
  type: 'player';
  filter: EntityFilter<'PLAYER', Player>;
  action: EntityAction<Player>;
};

export type ActionChoiceOptions = BaseChoiceOptions & {
  type: 'action';
  options: Array<[string, Action]>;
};

export type PlayerActions = { type: 'player_actions'; label: string };

export type ChoiceOptions =
  | PlayerActions
  | ActionChoiceOptions
  | PlayerChoiceOptions
  | CardChoiceOptions;

export type Action =
  | ['SEQ', ...Action[]]
  | ['GAME', EntityAction<Game>]
  | ['ZONE', ZoneId | ZoneId[], EntityAction<Zone>]
  | ['PLAYER', EntityFilter<'player', Player>, EntityAction<Player>]
  | ['CARD', EntityFilter<'card', Card>, EntityAction<Card>]
  | ['CALL', EntityAction<Game>]
  | ['CHOOSE', ChoiceOptions];

export type CardFilter = 'ALL' | CardId | CardId[] | ((c: Card) => boolean);

export type Effect = {
  type: 'card';
  target: CardFilter;
  modifier: (card: Card) => (props: CardProps) => void;
};

export type CardRef = `${string}/${number}`;

export type SpellAction = {
  desc: string;
  
  action: (self: Card) => EntityAction<Card>;
};

export type CardProps = PrintedProps & {
  abilities: Ability[];
  actions: SpellAction[];
};

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
