import { Entity } from './Entity';
import { Tokens, CardId, ZoneId } from './types';
import { Game } from './Game';
import { CardState } from '../state/State';
import { CardDefinition, Side } from '../state';
import { Zone } from './Zone';

export class Card extends Entity<'card'> {
  public override id: number;
  public definition: CardDefinition;
  public sideUp: Side = 'front';
  public token: Tokens = { damage: 0, progress: 0, resource: 0 };

  static fromJson(game: Game, zone: Zone, state: CardState) {
    const card = new Card(game, zone, state.id, state.definition);
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

  constructor(
    public game: Game,
    public zone: Zone,
    id: CardId,
    definition: CardDefinition
  ) {
    super(id, 'card');
    this.id = id;
    this.definition = definition;
  }

  generateResources(amount: number) {
    this.token.resource += amount;
  }

  dealDamage(amount: number) {
    this.token.damage += amount;
  }

  move(zone: Zone) {
    // TODO
  }
}
