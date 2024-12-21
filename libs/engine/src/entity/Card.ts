import { Entity } from './Entity';
import { Tokens, CardProps } from './types';
import { Game } from './Game';

export class Card extends Entity<'card'> {
  token: Tokens = { damage: 0, progress: 0, resource: 0 };

  constructor(public game: Game, public props: CardProps) {
    super(game.nextId++, 'card');
  }

  dealDamage(amount: number) {
    this.token.damage = this.token.damage + amount;
  }
}
