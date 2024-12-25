import { CardId, PlayerId } from './types';
import { Entity } from './Entity';
import { Agent } from '../agent/Agent';
import { PlayerDeck, Scenario } from '../state/GameSetupData';
import { Difficulty, GameState, GameZoneType } from '../state';
import { mapValues } from 'lodash';
import { Player } from './Player';
import { Zone } from './Zone';
import { Card } from './Card';
import { keys, values } from '../utils';

export class Game extends Entity<'game'> {
  public _nextId = 1;

  get nextId() {
    return this._nextId;
  }

  set nextId(value) {
    this._nextId = value;
  }

  public card: Record<CardId, Card> = {};
  public player: Record<PlayerId, Player> = {} as any;
  public zone: Record<GameZoneType, Zone> = {
    questDeck: new Zone(this, this.nextId++),
    encounterDeck: new Zone(this, this.nextId++),
    stagingArea: new Zone(this, this.nextId++),
    questArea: new Zone(this, this.nextId++),
    activeLocation: new Zone(this, this.nextId++),
    discardPile: new Zone(this, this.nextId++),
    victoryDisplay: new Zone(this, this.nextId++),
    removed: new Zone(this, this.nextId++),
  };

  static fromJson(state: GameState, agent: Agent) {
    const game = new Game(agent);
    for (const key of keys(state.card)) {
      const card = state.card[key];
      game.card[key] = Card.fromJson(game, card);
    }

    for (const key of keys(state.player)) {
      const card = state.player[key];
      game.player[key] = Player.fromJson(game, card);
    }

    for (const key of keys(state.zone)) {
      const card = state.zone[key];
      game.zone[key] = Zone.fromJson(game, card);
    }

    game.nextId = state.nextId;

    return game;
  }

  toJson(): GameState {
    return {
      nextId: this.nextId,
      card: mapValues(this.card, (card) => card.toJson()),
      player: mapValues(this.player, (player) => player.toJson()),
      zone: mapValues(this.zone, (zone) => zone.toJson()),
    };
  }

  constructor(public agent: Agent) {
    super(0, 'game');
  }

  get cards() {
    return values(this.card);
  }

  addPlayer(deck: PlayerDeck) {
    const id = Object.keys(this.player).length.toString() as PlayerId;
    const player = new Player(this, id);
    this.player[id] = player;
    for (const hero of deck.heroes) {
      const card = new Card(this, this.nextId++, hero);
      player.zone.playerArea.cards.push(card.id);
      this.card[card.id] = card;
    }

    for (const definition of deck.library) {
      const card = new Card(this, this.nextId++, definition);
      player.zone.library.cards.push(card.id);
      this.card[card.id] = card;
    }
  }

  setupScenario(scenario: Scenario, difficulty: Difficulty) {
    for (const definition of scenario.quest) {
      const card = new Card(this, this.nextId++, definition);
      this.zone.questDeck.cards.push(card.id);
      this.card[card.id] = card;
    }

    const cards =
      difficulty === 'easy'
        ? scenario.sets.flatMap((e) => (e.easy ? e.easy : []))
        : scenario.sets.flatMap((e) => [...e.easy, ...e.normal]);

    for (const definition of cards) {
      const card = new Card(this, this.nextId++, definition);
      this.zone.encounterDeck.cards.push(card.id);
      this.card[card.id] = card;
    }
  }

  start() {
    // todo
    this.agent.chooseNumber(1, 5);

    this.cards.forEach((card) => card.dealDamage(1));
  }
}
