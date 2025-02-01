import { Entity } from './Entity';
import { PlayerId } from './types';
import { Game } from './Game';
import { PlayerState } from '../state/State';
import { mapValues } from 'lodash';
import { Zone } from './Zone';
import { GameState, PlayerZoneType } from '../state';
import { repeat } from '../utils';

export class Player {
  public zones: Zone[] = [];

  toJSON(): PlayerState {
    return { id: this.id };
  }

  constructor(public game: Game, public id: PlayerId) {}

  getZone(type: PlayerZoneType): Zone {
    return this.game.zones.find((z) => z.type === type && z.owner === this)!;
  }
}
