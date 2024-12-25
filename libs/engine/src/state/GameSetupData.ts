import { Difficulty, Orientation } from './enums';
import { PrintedProps } from './PrintedProps';
import { State } from './State';

export type CardDefinition = {
  front: PrintedProps;
  back: PrintedProps;
  orientation: Orientation;
};

export type EncounterSet = {
  easy: CardDefinition[];
  normal: CardDefinition[];
};

export type PlayerDeck = {
  name: string;
  heroes: CardDefinition[];
  library: CardDefinition[];
};

export type Scenario = {
  name: string;
  quest: CardDefinition[];
  sets: EncounterSet[];
};

export type GameSetupData =
  | {
      type: 'scenario';
      data: ScenarioSetupData;
    }
  | { type: 'state'; state: State };

export type ScenarioSetupData = {
  players: PlayerDeck[];
  scenario: Scenario;
  difficulty: Difficulty;
  extra: {
    resources: number;
    cards: number;
  };
};
