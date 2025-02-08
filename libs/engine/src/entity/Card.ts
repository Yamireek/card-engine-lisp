import { Tokens, CardId, Token, ZoneId } from './types';
import { Game } from './Game';
import {
  CardDefinition,
  CardProps,
  CardRef,
  CardState,
  EntityMethod,
  Modifier,
  Side,
} from '../state';
import { cloneDeep } from 'lodash';
import { Zone } from './Zone';

export class Card {
  public def: CardDefinition;
  public props: CardProps;

  public modifiers: Modifier[] = [];
  public tapped = false;

  public token: Tokens = { damage: 0, progress: 0, resource: 0 };

  toJSON(): CardState {
    return {
      id: this.id,
      zoneId: this.zone.id,
      ref: this.ref,
      up: this.up,
      token: cloneDeep(this.token),
    };
  }

  constructor(
    public game: Game,
    public zone: Zone,
    public id: CardId,
    public ref: CardRef,
    public up: Side
  ) {
    this.def = this.game.repo.get(ref);
    this.props = cloneDeep(up === 'front' ? this.def.front : this.def.back);
  }

  get exhausted() {
    return this.tapped;
  }

  flip(side: Side) {
    this.up = side;
    this.props = cloneDeep(
      this.up === 'front' ? this.def.front : this.def.back
    );
  }

  addToken: EntityMethod<Card, [number, Token]> = (amount, type) => ({
    body: () => {
      this.token[type] += amount;
    },
  });

  ready: EntityMethod<Card> = () => ({
    body: () => {
      this.tapped = false;
    },
  });

  exhaust: EntityMethod<Card> = () => ({
    isAllowed: () => !this.tapped,
    body: () => {
      this.tapped = true;
    },
  });

  removeToken: EntityMethod<Card, [number, Token]> = (amount, type) => ({
    body: () => {
      this.token[type] = Math.max(0, this.token[type] - amount);
    },
  });

  heal: EntityMethod<Card, [number]> = (amount) => ({
    isAllowed: () => this.token.damage > 0,
    body: ['CALL', 'removeToken', amount, 'damage'],
  });

  dealDamage: EntityMethod<Card, [number]> = (amount) => ({
    body: ['CALL', 'addToken', amount, 'damage'],
  });

  moveTo: EntityMethod<Card, [ZoneId, Side?]> = (zoneId, side) => ({
    body: () => {
      const index = this.zone.cards.findIndex((c) => c === this);
      this.zone.cards.splice(index, 1);
      const zone = this.game.zone[zoneId];
      zone.cards.push(this);
      this.zone = zone;
      if (side) {
        this.flip(side);
      }
    },
  });
}
