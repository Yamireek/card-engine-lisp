import { Tokens, CardId } from './types';
import { Game } from './Game';
import { CardDefinition, CardProps, CardRef, Modifier, Side } from '../state';
import { cloneDeep, max, min } from 'lodash';

export class Card {
  public def: CardDefinition;
  public props: CardProps;

  public modifiers: Modifier[] = [];

  public token: Tokens = { damage: 0, progress: 0, resource: 0 };

  toJSON(): any {
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

  dealDamage(amount: number) {
    this.token.damage += amount;
    this.game.recalculate();
  }

  heal(amount: number) {
    this.token.damage = max([this.token.damage - amount, 0]) ?? 0;
    this.game.recalculate();
  }
}
