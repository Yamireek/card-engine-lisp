import { ZoneId } from './types';
import { Game } from './Game';
import { ZoneState } from '../state/State';
import {
  CardRef,
  EntityMethod,
  GameZoneType,
  PlayerZoneType,
  Side,
} from '../state';
import { Card } from './Card';
import { Player } from './Player';
import { shuffle } from '../utils';

export class Zone {
  public cards: Card[] = [];

  toJSON(): ZoneState {
    return {
      id: this.id,
      type: this.type,
      cards: this.cards.map((c) => c.id),
      owner: this.owner?.id,
    };
  }

  constructor(game: Game, id: ZoneId, type: GameZoneType);
  constructor(game: Game, id: ZoneId, type: PlayerZoneType, owner: Player);
  constructor(
    public game: Game,
    public id: ZoneId,
    public type: GameZoneType | PlayerZoneType,
    public owner?: Player
  ) {}

  addCards(definitions: CardRef[], up: Side) {
    for (const def of definitions) {
      const card = this.game.addCard(this, def, up);
      this.cards.push(card);
    }
  }

  shuffle: EntityMethod<Zone, []> = () => ({
    body: () => {
      shuffle(this.cards);
    },
  });
}
