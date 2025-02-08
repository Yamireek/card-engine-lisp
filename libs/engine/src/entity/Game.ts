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
  EntityMethod,
  GameState,
  GameZoneType,
  Phase,
  PlayerZoneType,
  Side,
  ZoneType,
} from '../state';
import { Player } from './Player';
import { Zone } from './Zone';
import { Card } from './Card';
import { stringify, values } from '../utils';
import { CardsRepo } from '../repo';
import { cloneDeep, isArray, sum } from 'lodash';
import { makeAutoObservable } from 'mobx';

export type Types = {
  CARD: { id: CardId; entity: Card; filter: EntityFilter<'CARD', Card> };
  PLAYER: {
    id: PlayerId;
    entity: Player;
    filter: EntityFilter<'PLAYER', Player>;
  };
  ZONE: { id: ZoneId; entity: Zone; filter: EntityFilter<'ZONE', Zone> };
  GAME: { id: never; entity: Game; filter: never };
};

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
      cards: values(this.zone)
        .flatMap((z) => z.cards)
        .map((c) => c.toJSON()),
      effects: this.effects.map(stringify),
    };
  }

  constructor(
    public repo: CardsRepo,
    setup: GameSetupData,
    observable = false
  ) {
    if (setup.type === 'scenario') {
      this.prepareScenario(setup.data.scenario, setup.data.difficulty);
      for (const playerDeck of setup.data.players) {
        this.addPlayer(playerDeck);
      }
    } else {
      const state = setup.data;

      this.nextId = state.nextId;

      for (const player of state.players) {
        (this.player as any)[player.id as any] = new Player(
          this,
          player.id,
          player.threat
        );
      }

      for (const zoneDto of state.zones) {
        const newZone = new Zone(
          this,
          zoneDto.id,
          zoneDto.type as any,
          zoneDto.owner ? (this.player as any)[zoneDto.owner as any] : undefined
        );

        this.zone[zoneDto.id] = newZone;
      }

      for (const data of state.cards) {
        const zone = this.zone[data.zoneId];
        const card = new Card(this, zone, data.id, data.ref, data.up);
        card.token = cloneDeep(data.token);
        zone.cards.push(card);
        this.card[data.id] = card;
      }

      for (const effect of state.effects) {
        this.effects.push(eval(effect));
      }
    }

    this.recalculate();
    if (observable) {
      makeAutoObservable(this);
      for (const player of this.players) {
        makeAutoObservable(player);
      }
      for (const zone of this.zones) {
        makeAutoObservable(zone);
      }
      for (const card of this.cards) {
        makeAutoObservable(card);
      }
    }
  }

  private addPlayer(deck: PlayerDeck) {
    const id = !this.player[0]
      ? '0'
      : !this.player[1]
      ? '1'
      : !this.player[2]
      ? '2'
      : '3';

    const heroes = deck.heroes.map((h) => this.repo.get(h));

    const player = new Player(
      this,
      id,
      sum(heroes.map((h) => h.front.threatCost ?? 0))
    );
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

  addCard(zone: Zone, ref: CardRef, up: Side) {
    const id = this.nextId++;
    const card = new Card(this, zone, id, ref, up);
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

  get encounterDeck() {
    return this.findZone('encounterDeck');
  }

  findZone(type: GameZoneType) {
    const zone = this.zones.find((z) => z.type === type && !z.owner);
    if (!zone) {
      throw new Error('zone not found');
    } else {
      return zone;
    }
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
      const targets = this.filter('CARD', effect.target as any);

      for (const card of targets) {
        const modify = effect.modifier(card);
        card.modifiers.push(modify);
        modify(card.props);
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

  filter<E extends keyof Types>(
    type: E,
    filter: Types[E]['filter']
  ): Array<Types[E]['entity']> {
    if (filter === 'ALL') {
      return this.getAll(type);
    }

    if (typeof filter === 'number') {
      return [this.getOne(type, filter)];
    }

    if (type === 'PLAYER' && typeof filter === 'string') {
      return [this.getOne(type, filter as any)];
    }

    if (isArray(filter)) {
      return filter.map((id) => this.getOne(type, id as any));
    }

    if (typeof filter === 'function') {
      return this.getAll(type).filter(filter as any);
    }

    throw new Error('unknown filter ' + JSON.stringify([type, filter]));
  }

  getOne<E extends keyof Types>(
    type: E,
    id: Types[E]['id']
  ): Types[E]['entity'] {
    switch (type) {
      case 'CARD':
        return this.card[id as any];
      case 'PLAYER':
        return (this.player as any)[id as any];
      case 'ZONE':
        return this.zone[id as any];
      default:
        throw new Error('unknown type ' + type);
    }
  }

  getAll<E extends keyof Types>(type: E): Array<Types[E]['entity']> {
    switch (type) {
      case 'CARD':
        return this.cards;
      case 'PLAYER':
        return this.players;
      case 'ZONE':
        return this.zones;
      default:
        throw new Error('unknown type ' + type);
    }
  }

  setup: EntityMethod<Game, []> = () => ({
    body: ['SEQ'], // TODO
  });

  playRound: EntityMethod<Game, []> = () => ({
    body: [
      'SEQ',
      ['CALL', 'playResourcePhase'],
      ['CALL', 'playPlanningPhase'],
      ['CALL', 'playQuestPhase'],
      ['CALL', 'playTravelPhase'],
      ['CALL', 'playEncounterPhase'],
      ['CALL', 'playCombatPhase'],
      ['CALL', 'playRefreshPhase'],
      ['CALL', 'endRound'],
    ],
  });

  playResourcePhase: EntityMethod<Game, []> = () => ({
    body: ['SEQ', ['CALL', 'beginPhase', 'resource'], ['CALL', 'endPhase']], // TODO
  });

  playPlanningPhase: EntityMethod<Game, []> = () => ({
    body: ['SEQ', ['CALL', 'beginPhase', 'planning'], ['CALL', 'endPhase']], // TODO
  });

  playQuestPhase: EntityMethod<Game, []> = () => ({
    body: ['SEQ', ['CALL', 'beginPhase', 'quest'], ['CALL', 'endPhase']], // TODO
  });

  playTravelPhase: EntityMethod<Game, []> = () => ({
    body: ['SEQ', ['CALL', 'beginPhase', 'travel'], ['CALL', 'endPhase']], // TODO
  });

  playEncounterPhase: EntityMethod<Game, []> = () => ({
    body: ['SEQ', ['CALL', 'beginPhase', 'encounter'], ['CALL', 'endPhase']], // TODO
  });

  playCombatPhase: EntityMethod<Game, []> = () => ({
    body: ['SEQ', ['CALL', 'beginPhase', 'combat'], ['CALL', 'endPhase']], // TODO
  });

  playRefreshPhase: EntityMethod<Game, []> = () => ({
    body: [
      'SEQ',
      ['CALL', 'beginPhase', 'refresh'],
      ['CARD', (c: Card) => c.exhausted, ['CALL', 'refresh']],
      ['CARD', (c: Card) => c.props.type === 'hero', ['CALL', 'dealDamage', 1]],
      ['PLAYER', 'ALL', ['CALL', 'incrementThreat', 1]],
      //['CALL', 'passFirstPlayerToken'], // TODO
      [
        'CHOOSE',
        {
          player: '0',
          label: 'Choose card',
          type: 'action',
          options: [['A', ['CARD', 'ALL', ['CALL', 'dealDamage', 1]]]],
        },
      ],
      ['CALL', 'endPhase'],
    ],
  });

  endRound: EntityMethod<Game, []> = () => ({
    body: ['SEQ'], // TODO
  });

  beginPhase: EntityMethod<Game, [Phase]> = () => ({
    body: ['SEQ'], // TODO
  });

  endPhase: EntityMethod<Game, []> = () => ({
    body: ['SEQ'], // TODO
  });

  begin(): Action {
    return [
      'GAME',
      [
        'SEQ',
        ['ZONE', this.encounterDeck.id, ['CALL', 'shuffle']],
        ['ZONE', this.players.map((p) => p.library.id), ['CALL', 'shuffle']],
        ['PLAYER', 'ALL', ['CALL', 'draw', 6]],
        ['CALL', 'setup'],
        ['CALL', 'playRound'],
      ],
    ];
  }
}
