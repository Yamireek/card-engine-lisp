import { Entity } from './Entity';
import { CardId, ZoneId } from './types';
import { Game } from './Game';
import { ZoneState } from '../state/State';
import {
  CardDefinition,
  CardRef,
  CardState,
  GameZoneType,
  PlayerZoneType,
  Side,
  ZoneType,
} from '../state';
import { Card } from './Card';
import { Player } from './Player';

export class Zone {
  public cards: Card[] = [];

  toJSON(): any {
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
      const card = this.game.addCard(def, up);
      this.cards.push(card);
    }
  }
}
