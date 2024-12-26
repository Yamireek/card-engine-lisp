import { Entity } from './Entity';
import { PlayerId } from './types';
import { Game } from './Game';
import { PlayerState } from '../state/State';
import { mapValues } from 'lodash';
import { Zone } from './Zone';
import { GameState, PlayerZoneType } from '../state';
import { repeat } from '../utils';

export class Player extends Entity<'player'> {
  public override id: PlayerId;
  public zone: Record<PlayerZoneType, Zone> = {
    library: new Zone(this.game, this.game.nextId++, 'library'),
    hand: new Zone(this.game, this.game.nextId++, 'hand'),
    discardPile: new Zone(this.game, this.game.nextId++, 'discardPile'),
    playerArea: new Zone(this.game, this.game.nextId++, 'playerArea'),
    engaged: new Zone(this.game, this.game.nextId++, 'engaged'),
  };

  static fromJson(game: Game, state: PlayerState, cards: GameState['card']) {
    const player = new Player(game, state.id);
    player.zone = mapValues(state.zone, (zone) =>
      Zone.fromJson(game, zone, cards)
    );
    return player;
  }

  toJson(): PlayerState {
    return {
      id: this.id,
      zone: mapValues(this.zone, (zone) => zone.toJson()),
    };
  }

  constructor(public game: Game, id: PlayerId) {
    super(id, 'player');
    this.id = id;
  }

  draw(amount: number) {
    repeat(amount, () => this.zone.library.topCard.move(this.zone.hand));
  }
}
