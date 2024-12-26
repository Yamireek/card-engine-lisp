import { Entity } from './Entity';
import { CardId, ZoneId } from './types';
import { Game } from './Game';
import { ZoneState } from '../state/State';
import { CardDefinition, CardState, ZoneType } from '../state';
import { Card } from './Card';

export class Zone extends Entity<'zone'> {
  public override id: ZoneId;
  public type: ZoneType;
  public cards: CardId[] = [];

  get topCard() {
    return this.game.card[this.cards[this.cards.length - 1]];
  }

  static fromJson(
    game: Game,
    state: ZoneState,
    cards: Record<CardId, CardState>
  ) {
    const zone = new Zone(game, state.id, state.type);
    zone.cards = state.cards;
    for (const id of zone.cards) {
      game.card[id] = Card.fromJson(game, zone, cards[id]);
    }
    return zone;
  }

  toJson(): ZoneState {
    return {
      id: this.id,
      cards: this.cards,
      type: this.type,
    };
  }

  constructor(public game: Game, id: ZoneId, type: ZoneType) {
    super(id, 'zone');
    this.id = id;
    this.type = type;
  }

  shuffle() {
    // TODO
  }

  addCard(game: Game, definition: CardDefinition) {
    const card = new Card(game, this, game.nextId++, definition);
    this.cards.push(card.id);
    game.card[card.id] = card;
  }
}
