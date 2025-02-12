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
  Mark,
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
import { cloneDeep, isArray, sum, sumBy } from 'lodash';
import { makeAutoObservable, toJS } from 'mobx';

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

export type Triggers = { end_of_round: Action[] };

export type Limits = Record<string, { usages: number; max: number }>;

export class Game {
  public nextId = 1;
  public player: Record<PlayerId, Player> = {};
  public zone: Record<ZoneId, Zone> = {};
  public card: Record<CardId, Card> = {};
  public effects: Effect[] = [];
  public triggers: Triggers = { end_of_round: [] };
  public limits: Limits = {};

  toJSON(): GameState {
    return {
      nextId: this.nextId,
      players: this.players.map((p) => p.toJSON()),
      zones: this.zones.map((z) => z.toJSON()),
      cards: this.zones.flatMap((z) => z.cards).map((c) => c.toJSON()),
      effects: this.effects.map(stringify),
      triggers: stringify(this.triggers),
      limits: toJS(this.limits),
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

      this.triggers = eval(state.triggers);
      this.limits = cloneDeep(state.limits);
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
    const id = this.players.length + 1;

    const heroes = deck.heroes.map((h) => this.repo.get(h));

    const player = new Player(
      this,
      Number(id),
      sum(heroes.map((h) => h.front.threatCost ?? 0))
    );
    this.player[Number(id)] = player;

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

  get inAPlay() {
    return values(this.card); // TODO only in play
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

  get activeLocation() {
    return this.findZone('activeLocation');
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
      card.props.actions = [];
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

  canEntityExe<E extends keyof Types>(
    type: E,
    entity: Types[E]['entity'],
    action: EntityAction<Types[E]['entity']>
  ): boolean {
    const inst = action[0];
    switch (inst) {
      case 'CALL': {
        const [, name, ...args] = action;
        const method = (entity as any)[name as any](...args);
        return method.isAllowed ? method.isAllowed() : true;
      }
      case 'SEQ': {
        const [, ...actions] = action;
        return actions.every((a) => this.canEntityExe(type, entity, a));
      }
      case 'REPEAT':
      case 'WHILE':
        throw new Error('not implemented');
      default:
        return this.canExe(action);
    }
  }

  canExe(action: Action): boolean {
    const type = action[0];
    switch (type) {
      case 'CHOOSE': {
        const options = action[1];
        switch (options.type) {
          case 'player': {
            const targets = this.filter('PLAYER', options.filter);
            const filtered = targets.filter((p) =>
              this.canEntityExe('PLAYER', p, options.action)
            );
            if (options.min && filtered.length < options.min) {
              return false;
            }

            return true;
          }
          default:
            throw new Error('not implemented');
        }
      }
      case 'SPEND_LIMIT': {
        const limit = this.limits[action[1].name];
        return !limit || limit.usages < limit.max;
      }
      case 'SET_TRIGGER':
        return true;
      default:
        throw new Error('not implemented');
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
    body: [
      'SEQ',
      ['CALL', 'beginPhase', 'resource'],
      ['PLAYER', 'ALL', ['CALL', 'draw', 1]],
      [
        'CARD',
        this.cards.filter((c) => c.props.type === 'hero').map((c) => c.id),
        ['CALL', 'generateResources', 1],
      ],
      ['CHOOSE', { type: 'player_actions', label: 'End resource phase' }],
      ['CALL', 'endPhase'],
    ],
  });

  playPlanningPhase: EntityMethod<Game, []> = () => ({
    body: [
      'SEQ',
      ['CALL', 'beginPhase', 'planning'],
      ['CHOOSE', { type: 'player_actions', label: 'End planning phase' }],
      ['CALL', 'endPhase'],
    ],
  });

  playQuestPhase: EntityMethod<Game, []> = () => ({
    body: [
      'SEQ',
      ['CALL', 'beginPhase', 'quest'],
      ['PLAYER', 'ALL', ['CALL', 'commitCharactersToQuest']],
      ['CHOOSE', { type: 'player_actions', label: 'Staging' }],
      [
        'REPEAT',
        this.players.length,
        ['PLAYER', 'ALL', ['CALL', 'revealEncounterCard']],
      ],
      ['CHOOSE', { type: 'player_actions', label: 'Quest resolution' }],
      ['CALL', 'resolveQuesting'],
      ['CHOOSE', { type: 'player_actions', label: 'End quest phase' }],
      ['CALL', 'clearMarks', 'questing'],
      ['CALL', 'endPhase'],
    ],
  });

  playTravelPhase: EntityMethod<Game, []> = () => ({
    body: [
      'SEQ',
      ['CALL', 'beginPhase', 'travel'],
      this.activeLocation.cards.length === 0
        ? [
            'CHOOSE',
            {
              label: 'Choose location for travel',
              type: 'card',
              filter: 'ALL',
              player: 1, // TODO first player
              action: ['CALL', 'travel'],
              min: 0,
              max: 1,
            },
          ]
        : ['SEQ'],
      ['CHOOSE', { type: 'player_actions', label: 'End travel phase' }],
      ['CALL', 'endPhase'],
    ],
  });

  get enemiesToEngage() {
    return []; // TODO
  }

  playEncounterPhase: EntityMethod<Game, []> = () => ({
    body: [
      'SEQ',
      ['CALL', 'beginPhase', 'encounter'],
      ['PLAYER', 'ALL', ['CALL', 'optionalEngagement']],
      ['CHOOSE', { type: 'player_actions', label: 'Engagement Checks' }],
      [
        'WHILE',
        () => this.enemiesToEngage.length > 0,
        ['PLAYER', 'ALL', ['CALL', 'engagementCheck']],
      ],
      ['CHOOSE', { type: 'player_actions', label: 'End encounter phase' }],
      ['CALL', 'endPhase'],
    ],
  });

  playCombatPhase: EntityMethod<Game, []> = () => ({
    body: ['SEQ', ['CALL', 'beginPhase', 'combat'], ['CALL', 'endPhase']], // TODO
  });

  playRefreshPhase: EntityMethod<Game, []> = () => ({
    body: [
      'SEQ',
      ['CALL', 'beginPhase', 'refresh'],
      ['CARD', (c: Card) => c.exhausted, ['CALL', 'ready']],
      ['PLAYER', 'ALL', ['CALL', 'incrementThreat', 1]],
      //['CALL', 'passFirstPlayerToken'], // TODO
      [
        'CHOOSE',
        {
          label: 'End refresh phase',
          type: 'player_actions',
        },
      ],
      ['CALL', 'endPhase'],
    ],
  });

  endRound: EntityMethod<Game, []> = () => ({
    body: [
      'SEQ',
      ...this.triggers.end_of_round.map((t) => t),
      ['CALL', 'playRound'],
    ],
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

  clearMarks: EntityMethod<Game, [Mark]> = (mark) => ({
    body: () => {
      for (const card of this.cards) {
        delete card.mark[mark];
      }
    },
  });

  placeProgress: EntityMethod<Game, [number]> = (amount) => ({
    body: () => {
      // TODO
    },
  });

  resolveQuesting: EntityMethod<Game, []> = () => ({
    body: () => {
      const willpower = sumBy(
        this.inAPlay.filter((c) => c.mark.questing),
        (c) => c.props.willpower ?? 0
      );
      const threat = sumBy(this.inAPlay, (c) => c.props.threat ?? 0);

      if (willpower > threat) {
        return ['CALL', 'placeProgress', willpower - threat];
      }

      if (threat > willpower) {
        return [
          'PLAYER',
          'ALL',
          ['CALL', 'incrementThreat', threat - willpower],
        ];
      }
    },
  });
}
