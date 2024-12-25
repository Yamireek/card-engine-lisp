import { Entity } from './Entity';
import { Tokens, CardId } from './types';
import { Game } from './Game';
import { CardState } from '../state/State';
import { CardDefinition, Side } from '../state';

export class Card extends Entity<'card'> {
  public override id: number;
  public definition: CardDefinition;
  public sideUp: Side = 'front';
  public token: Tokens = { damage: 0, progress: 0, resource: 0 };

  static fromJson(game: Game, state: CardState) {
    const card = new Card(game, state.id, state.definition);
    card.token = state.tokens;
    card.sideUp = state.sideUp;
    return card;
  }

  toJson(): CardState {
    return {
      id: this.id,
      definition: this.definition,
      sideUp: this.sideUp,
      tokens: this.token,
    };
  }

  constructor(public game: Game, id: CardId, definition: CardDefinition) {
    super(id, 'card');
    this.id = id;
    this.definition = definition;
  }

  dealDamage(amount: number) {
    this.token.damage = this.token.damage + amount;
  }
}
