import { CardType, Keywords, Mark, Sphere, Trait } from './enums';

export type PrintedProps = {
  type: CardType;
  name?: string;
  threatCost?: number;
  willpower?: number;
  attack?: number;
  defense?: number;
  hitPoints?: number;
  traits: Trait[];
  sphere: Sphere[];
  sequence?: number;
  questPoints?: number;
  cost?: number | 'X';
  unique?: boolean;
  engagement?: number;
  threat?: number;
  keywords?: Keywords;
  hitpoints?: number;
  victory?: number;
};

export type HeroProps = {
  type: 'hero';
  name: string;
  threatCost: number;
  willpower: number;
  attack: number;
  defense: number;
  hitPoints: number;
  traits: Trait[];
  sphere: Sphere;
  unique: true;
  keywords?: Keywords;
};

export type AllyProps = {
  type: 'ally';
  name: string;
  unique: boolean;
  cost: number;
  willpower: number;
  attack: number;
  defense: number;
  hitPoints: number;
  traits: Trait[];
  sphere: Sphere;
  keywords?: Keywords;
};

export type EventProps = {
  type: 'event';
  name: string;
  cost: number | 'X';
  sphere: Sphere;
  keywords?: Keywords;
};

export type AttachmentProps = {
  type: 'attachment';
  name: string;
  unique: boolean;
  cost: number;
  traits: Trait[];
  sphere: Sphere;
  keywords?: Keywords;
};

export type LocationProps = {
  type: 'location';
  name: string;
  threat: number;
  questPoints: number;
  traits: Trait[];
  victory?: number;
  keywords?: Keywords;
};

export type EnemyProps = {
  type: 'enemy';
  name: string;
  engagement: number;
  threat: number;
  attack: number;
  defense: number;
  hitPoints: number;
  traits: Trait[];
  victory?: number;
  keywords?: Keywords;
};

export type QuestProps = {
  type: 'quest';
  name: string;
  sequence: number;
  questPoints: number;
};

export type TreacheryProps = {
  type: 'treachery';
  name: string;
  keywords?: Keywords;
};

export type BackSideProps = {
  type: 'back';
};

export type Marks = Record<Mark, boolean>;

export type QuestDefinition =
  | {
      sequence: number;
      name?: never;
      a: { name: string };
      b: { name: string; questPoints: number };
    }
  | {
      sequence: number;
      name: string;
      a: { name?: never };
      b: { name?: never; questPoints: number };
    };
