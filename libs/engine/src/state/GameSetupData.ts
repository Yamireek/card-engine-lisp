import { Card } from '../entity';
import { Difficulty, Orientation } from './enums';
import { PrintedProps } from './PrintedProps';

export type Modifier = (props: CardProps) => void;

export type Ability = {
  description: string;
  code: (self: Card) => Effect;
};

export type Effect = {
  type: 'card';
  target: Card | ((card: Card) => boolean);
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

export type JSONSetupData = { type: 'json'; data: any };

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
