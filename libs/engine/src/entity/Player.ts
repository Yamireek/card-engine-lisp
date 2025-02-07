import { PlayerId } from './types';
import { Game } from './Game';
import { PlayerState } from '../state/State';
import { Zone } from './Zone';
import { EntityAction, EntityMethod, PlayerZoneType } from '../state';

export class Player {
  public zones: Zone[] = [];

  toJSON(): PlayerState {
    return { id: this.id };
  }

  constructor(public game: Game, public id: PlayerId) {}

  getZone(type: PlayerZoneType): Zone {
    const zone = this.game.zones.find(
      (z) => z.type === type && z.owner === this
    );
    if (!zone) {
      throw new Error('zone not found');
    }
    return zone;
  }

  get library() {
    return this.getZone('library');
  }

  get hand() {
    return this.getZone('hand');
  }

  draw: EntityMethod<Player, [number]> = (amount) => ({
    isAllowed: () => this.library.cards.length > 0,
    body: [
      'GAME',
      [
        'CARD',
        this.library.cards.slice(0, amount).map((c) => c.id),
        ['CALL', 'moveTo', this.hand.id],
      ],
    ],
  });
}
