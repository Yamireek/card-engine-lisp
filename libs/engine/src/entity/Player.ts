import { PlayerId } from './types';
import { Game } from './Game';
import { PlayerState } from '../state/State';
import { Zone } from './Zone';
import { EntityMethod, PlayerZoneType } from '../state';

export class Player {
  public zones: Zone[] = [];

  toJSON(): PlayerState {
    return { id: this.id, threat: this.threat };
  }

  constructor(public game: Game, public id: PlayerId, public threat: number) {}

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

  incrementThreat: EntityMethod<Player, [number]> = (amount) => ({
    body: () => {
      this.threat += amount;
    },
  });

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
