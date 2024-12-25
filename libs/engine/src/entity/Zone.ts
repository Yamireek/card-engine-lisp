import { Entity } from './Entity';
import { CardId, ZoneId } from './types';
import { Game } from './Game';
import { ZoneState } from '../state/State';
import { ZoneType } from '../state';

export class Zone extends Entity<'zone'> {
  public override id: ZoneId;
  public type: ZoneType;
  public cards: CardId[] = [];

  static fromJson(game: Game, state: ZoneState) {
    const zone = new Zone(game, state.id, state.type);
    zone.cards = state.cards;
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
}
