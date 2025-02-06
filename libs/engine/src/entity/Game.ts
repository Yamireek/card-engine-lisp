/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardId, PlayerId, ZoneId } from './types';
import {
  CardRef,
  Effect,
  GameSetupData,
  PlayerDeck,
  Scenario,
} from '../state/GameSetupData';
import {
  Action,
  Difficulty,
  EntityAction,
  EntityFilter,
  GameState,
  GameZoneType,
  PlayerZoneType,
  Side,
  State,
  ZoneType,
} from '../state';
import { Player } from './Player';
import { Zone } from './Zone';
import { Card } from './Card';
import { stringify, values } from '../utils';
import { CardsRepo } from '../repo';
import { cloneDeep, isArray } from 'lodash';

export function cardAction(
  target: EntityFilter<'card', Card>,
  action: EntityAction<Card>
): ['CARD', EntityFilter<'card', Card>, EntityAction<Card>] {
  return ['CARD', target, action];
}

export class Interpreter2 {
  public stack: Action[] = [];

  toJSON(): State {
    return {
      game: this.game.toJSON(),
      stack: this.stack.map((s) => stringify(s)),
    };
  }

  constructor(public game: Game) {}

  step() {
    const next = this.stack.shift();
    if (next) {
      return this.exe(next);
    } else {
      return true;
    }
  }

  run(...actions: Action[]) {
    this.stack.unshift(...actions);
    while (true) {
      const stop = this.step();
      if (stop) {
        break;
      }
    }
  }

  exe(action: Action): boolean {
    const type = action[0];
    switch (type) {
      case 'CARD': {
        const [, filter, operation] = action;
        if (typeof filter === 'number') {
          const card = this.game.card[filter];
          return this.exeOnCard(card, operation);
        } else {
          const targets = this.game.filterCards(filter);
          const ins = targets.map((t) => ['CARD', t.id, operation]);
          this.stack.unshift(...(ins as any));
          return false;
        }
      }
      case 'CHOOSE': {
        this.stack.unshift(action);
        return true;
      }
      default: {
        throw new Error('unknown action: ' + JSON.stringify(action));
      }
    }
  }

  exeOnCard(card: Card, action: EntityAction<Card>): boolean {
    const type = action[0];
    switch (type) {
      case 'CALL': {
        const [, name, ...args] = action;
        const method = (card as any)[name as any](...args);
        if (typeof method.body === 'function') {
          console.log('update', card.props.name, name, ...args);
          method.body();
          return false;
        } else {
          if (!method.isAllowed || method.isAllowed()) {
            return this.exeOnCard(card, method.body);
          } else {
            return false;
          }
        }
      }
      case 'SEQ': {
        const [, ...actions] = action;
        this.stack.unshift(...actions.map((a) => cardAction(card.id, a)));
        return false;
      }
      case 'GAME': {
        const [, a] = action;
        return this.exe(a as any);
      }
      default: {
        throw new Error('uknown action: ' + JSON.stringify(action));
      }
    }
  }
}

export class Game {
  public nextId = 1;
  public player: Partial<Record<PlayerId, Player>> = {};
  public zone: Record<ZoneId, Zone> = {};
  public card: Record<CardId, Card> = {};
  public effects: Effect[] = [];

  toJSON(): GameState {
    return {
      nextId: this.nextId,
      players: values(this.player).map((p) => p.toJSON()),
      zones: values(this.zone).map((z) => z.toJSON()),
      cards: values(this.card).map((c) => c.toJSON()),
      effects: this.effects.map(stringify),
    };
  }

  constructor(public repo: CardsRepo, setup: GameSetupData) {
    if (setup.type === 'scenario') {
      this.prepareScenario(setup.data.scenario, setup.data.difficulty);
      for (const playerDeck of setup.data.players) {
        this.addPlayer(playerDeck);
      }
    } else {
      const state = setup.data;

      this.nextId = state.nextId;

      for (const player of state.players) {
        (this.player as any)[player.id as any] = new Player(this, player.id);
      }

      for (const card of state.cards) {
        this.card[card.id] = new Card(this, card.id, card.ref, card.up);
        this.card[card.id].token = cloneDeep(card.token);
      }

      for (const zone of state.zones) {
        const newZone = new Zone(
          this,
          zone.id,
          zone.type as any,
          zone.owner ? (this.player as any)[zone.owner as any] : undefined
        );

        for (const cardId of zone.cards) {
          newZone.cards.push(this.card[cardId]);
        }

        this.zone[zone.id] = newZone;
      }

      for (const effect of state.effects) {
        this.effects.push(eval(effect));
      }
    }

    this.recalculate();
  }

  private addPlayer(deck: PlayerDeck) {
    const id = !this.player[0]
      ? '0'
      : !this.player[1]
      ? '1'
      : !this.player[2]
      ? '2'
      : '3';

    const player = new Player(this, id);
    this.player[id] = player;

    this.addZone('library', player).addCards(deck.library, 'back');
    this.addZone('hand', player);
    this.addZone('playerArea', player).addCards(deck.heroes, 'front');
    this.addZone('engaged', player);
    this.addZone('discardPile', player);
  }

  private addZone(type: GameZoneType): Zone;
  private addZone(type: PlayerZoneType, owner: Player): Zone;
  private addZone(type: ZoneType, owner?: Player): Zone {
    const id = this.nextId++;
    const zone = new Zone(this, id, type as any, owner as any);
    this.zone[id] = zone;
    return zone;
  }

  private prepareScenario(scenario: Scenario, difficulty: Difficulty) {
    this.addZone('activeLocation');
    this.addZone('discardPile');
    this.addZone('encounterDeck').addCards(
      scenario.sets.flatMap((s) =>
        difficulty === 'easy' ? s.easy : [...s.easy, ...s.normal]
      ),
      'back'
    );
    this.addZone('questDeck').addCards(scenario.quest, 'back');
    this.addZone('questArea');
    this.addZone('removed');
    this.addZone('stagingArea');
    this.addZone('victoryDisplay');
  }

  addCard(ref: CardRef, up: Side) {
    const id = this.nextId++;
    const card = new Card(this, id, ref, up);
    this.card[id] = card;
    return card;
  }

  get cards() {
    return values(this.card);
  }

  get players() {
    return values(this.player);
  }

  get zones() {
    return values(this.zone);
  }

  getCard(name: string) {
    const card = this.cards.find((c) => c.props.name === name);
    if (!card) {
      throw new Error('card not found');
    }
    return card;
  }

  getZone(type: GameZoneType) {
    const zone = this.zones.find((z) => z.type === type && !z.owner);
    if (!zone) {
      throw new Error('zone not found');
    }
    return zone;
  }

  recalculate() {
    for (const card of this.cards) {
      card.modifiers = [];
      card.props = cloneDeep(
        card.up === 'front' ? card.def.front : card.def.back
      );
    }

    const effects: Effect[] = [];

    for (const card of this.cards) {
      for (const ability of card.props.abilities) {
        effects.push(ability.code(card));
      }
    }

    for (const effect of [...effects, ...this.effects]) {
      const targets = this.filterCards(effect.target);

      for (const card of targets) {
        const modify = effect.modifier(card);
        card.modifiers.push(modify);
        modify(card.props);
      }
    }
  }

  exe(action: Action) {
    const type = action[0];
    switch (type) {
      case 'CARD': {
        const [, filter, operation] = action;
        const targets = this.filterCards(filter);
        for (const target of targets) {
          this.exeOnCard(target, operation);
        }
        break;
      }
      case 'CHOOSE': {
        // TODO
      }
    }

    this.recalculate();
  }

  exeOnCard(card: Card, action: EntityAction<Card>) {
    const type = action[0];
    switch (type) {
      case 'CALL': {
        const [, name, ...args] = action;
        const method = (card as any)[name as any](...args);
        if (typeof method.body === 'function') {
          method.body();
        } else {
          this.exeOnCard(card, method.body);
        }
        break;
      }
      case 'SEQ': {
        const [, ...actions] = action;
        for (const action of actions) {
          this.exeOnCard(card, action);
        }
        break;
      }
      case 'GAME': {
        const [, a] = action;
        this.exe(a as any);
      }
    }
  }

  canCardExe(card: Card, action: EntityAction<Card>): boolean {
    const type = action[0];
    switch (type) {
      case 'CALL': {
        const [, name, ...args] = action;
        const method = (card as any)[name as any](...args);
        if (typeof method.body === 'function') {
          return true;
        } else {
          return method.isAllowed ? method.isAllowed() : true;
        }
      }
      case 'SEQ': {
        const [, ...actions] = action;
        return actions.every((a) => this.canCardExe(card, a));
      }
      default: {
        throw new Error('not implemented');
      }
    }
  }

  filterCards(filter: EntityFilter<'card', Card>) {
    if (filter === 'ALL') {
      return this.cards;
    } else if (typeof filter === 'number') {
      return [this.card[filter]];
    } else if (typeof filter === 'string') {
      throw new Error('incorret card filter');
    } else if (isArray(filter)) {
      return this.cards.filter((c) => filter.includes(c.id));
    } else {
      return this.cards.filter(filter);
    }
  }

  begin(): Action {
    return [
      'CHOOSE',
      {
        label: 'Choose hero',
        type: 'card',
        filter: (c) => c.props.type === 'hero',
        action: ['CALL', 'dealDamage', 1],
        player: '0',
      },
    ];
  }
}
