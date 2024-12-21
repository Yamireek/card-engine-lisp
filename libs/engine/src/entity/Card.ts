import { Entity } from './Entity';
import { Tokens, CardProps, CardId } from './types';
import { Game } from './Game';
import { CardState } from '../state/State';

export class Card extends Entity<'card'> {
  public override id: number;
  public props: CardProps;
  public token: Tokens = { damage: 0, progress: 0, resource: 0 };

  static fromJson(game: Game, state: CardState) {
    const card = new Card(game, state.id, state.props);
    card.token = state.tokens;
    return card;
  }

  toJson(): CardState {
    return {
      id: this.id,
      props: this.props,
      tokens: this.token,
    };
  }

  constructor(public game: Game, id: CardId, props: CardProps) {
    super(id, 'card');
    this.id = id;
    this.props = props;
  }

  dealDamage(amount: number) {
    this.token.damage = this.token.damage + amount;
  }
}
