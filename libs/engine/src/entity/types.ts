import { Flavor } from '../types';

export type CardId = Flavor<number, 'CARD'>;

export type ZoneId = Flavor<number, 'ZONE'>;

export type PlayerId = Flavor<number, 'PLAYER'>;

export type Token = 'damage' | 'progress' | 'resource';

export type Tokens = Record<Token, number>;
