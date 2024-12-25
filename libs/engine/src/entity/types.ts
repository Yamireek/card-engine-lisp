import { CardType } from '../state';
import { Flavor } from '../types';

export type CardId = Flavor<number, 'card'>;

export type ZoneId = Flavor<number, 'zone'>;

export type PlayerId = '0' | '1' | '2' | '3';

export type Token = 'damage' | 'progress' | 'resource';

export type Tokens = Record<Token, number>;
