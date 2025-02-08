import { Flavor } from '../types';

export type CardId = Flavor<number, 'CARD'>;

export type ZoneId = Flavor<number, 'ZONE'>;

export type PlayerId = Flavor<'0' | '1' | '2' | '3', 'PLAYER'>;

export type Token = 'damage' | 'progress' | 'resource';

export type Tokens = Record<Token, number>;
