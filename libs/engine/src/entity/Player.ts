import { PlayerId } from './types';
import { Game } from './Game';
import { PlayerState } from '../state/State';
import { Zone } from './Zone';
import { PlayerZoneType } from '../state';

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
}
