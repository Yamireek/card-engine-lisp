import { Tokens, CardId, Token } from './types';
import { Game } from './Game';
import {
  CardDefinition,
  CardProps,
  CardRef,
  CardState,
  EntityMethod,
  Modifier,
  Side,
} from '../state';
import { cloneDeep } from 'lodash';

export class Card {
  public def: CardDefinition;
  public props: CardProps;

  public modifiers: Modifier[] = [];

  public token: Tokens = { damage: 0, progress: 0, resource: 0 };

  toJSON(): CardState {
    return {
      id: this.id,
      ref: this.ref,
      up: this.up,
      token: this.token,
    };
  }

  constructor(
    public game: Game,
    public id: CardId,
    public ref: CardRef,
    public up: Side
  ) {
    this.def = this.game.repo.get(ref);
    this.props = cloneDeep(up === 'front' ? this.def.front : this.def.back);
  }

  addToken: EntityMethod<Card, [number, Token]> = (amount, type) => ({
    body: () => {
      this.token[type] += amount;
    },
  });

  removeToken: EntityMethod<Card, [number, Token]> = (amount, type) => ({
    body: () => {
      this.token[type] = Math.max(0, this.token[type] - amount);
    },
  });

  heal: EntityMethod<Card, [number]> = (amount) => ({
    isAllowed: () => this.token.damage > 0,
    body: ['CALL', 'removeToken', amount, 'damage'],
  });

  dealDamage: EntityMethod<Card, [number]> = (amount) => ({
    body: ['CALL', 'addToken', amount, 'damage'],
  });
}
