import { Entity } from './Entity';
import { CardId, ZoneId } from './types';
import { Game } from './Game';
import { ZoneState } from '../state/State';

export class Zone extends Entity<'zone'> {
  public override id: ZoneId;
  public cards: CardId[] = [];

  static fromJson(game: Game, state: ZoneState) {
    const zone = new Zone(game, state.id);
    zone.cards = state.cards;
    return zone;
  }

  toJson(): ZoneState {
    return {
      id: this.id,
      cards: this.cards,
    };
  }

  constructor(public game: Game, id: ZoneId) {
    super(id, 'zone');
    this.id = id;
  }
}
