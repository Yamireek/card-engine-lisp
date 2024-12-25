import { Flavor } from '../types';

export type CardId = Flavor<number, 'card'>;

export type ZoneId = Flavor<number, 'zone'>;

export type PlayerId = '0' | '1' | '2' | '3';

export type CardType = 'hero' | 'ally' | 'enemy';

export type CardProps = {
  name: string;
  type: CardType;
  att: number;
  def: number;
};

export type Token = 'damage' | 'progress' | 'resource';

export type Tokens = Record<Token, number>;
