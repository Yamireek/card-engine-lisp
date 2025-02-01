import { Tokens, CardId, Token } from './types';
import { Game } from './Game';
import {
  CardDefinition,
  CardProps,
  CardRef,
  CardState,
  Modifier,
  Side,
} from '../state';
import { cloneDeep, max, min } from 'lodash';

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

  addToken(amount: number, token: Token) {
    this.token[token] += amount;
    return true;
  }

  removeToken(amount: number, token: Token) {
    const removed = max([this.token[token], amount]) ?? 0;
    this.token[token] -= removed;
    return removed > 0;
  }
}
