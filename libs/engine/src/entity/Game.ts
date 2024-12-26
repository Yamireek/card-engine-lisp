import { CardId, PlayerId, ZoneId } from './types';
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
  public nextId = 1;
  public card: Record<CardId, Card> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public player: Record<PlayerId, Player> = {} as any;
  public zone: Record<ZoneId, Zone> = {};
  public zones: Record<GameZoneType, Zone> = {
    questDeck: new Zone(this, this.nextId++, 'questDeck'),
    encounterDeck: new Zone(this, this.nextId++, 'encounterDeck'),
    stagingArea: new Zone(this, this.nextId++, 'stagingArea'),
    questArea: new Zone(this, this.nextId++, 'questArea'),
    activeLocation: new Zone(this, this.nextId++, 'activeLocation'),
    discardPile: new Zone(this, this.nextId++, 'discardPile'),
    victoryDisplay: new Zone(this, this.nextId++, 'victoryDisplay'),
    removed: new Zone(this, this.nextId++, 'removed'),
  };

  static fromJson(state: GameState, agent: Agent) {
    const game = new Game(agent);

    for (const key of keys(state.player)) {
      const card = state.player[key];
      game.player[key] = Player.fromJson(game, card, state.card);
    }

    for (const key of keys(state.zone)) {
      const card = state.zone[key];
      game.zones[key] = Zone.fromJson(game, card, state.card);
    }

    game.nextId = state.nextId;

    return game;
  }

  toJson(): GameState {
    return {
      nextId: this.nextId,
      card: mapValues(this.card, (card) => card.toJson()),
      player: mapValues(this.player, (player) => player.toJson()),
      zone: mapValues(this.zones, (zone) => zone.toJson()),
    };
  }

  constructor(public agent: Agent) {
    super(0, 'game');
  }

  get cards() {
    return values(this.card);
  }

  get players() {
    return values(this.player);
  }

  addPlayer(deck: PlayerDeck) {
    const id = Object.keys(this.player).length.toString() as PlayerId;
    const player = new Player(this, id);
    this.player[id] = player;
    for (const hero of deck.heroes) {
      player.zone.playerArea.addCard(this, hero);
    }

    for (const definition of deck.library) {
      player.zone.library.addCard(this, definition);
    }
  }

  setupScenario(scenario: Scenario, difficulty: Difficulty) {
    for (const definition of scenario.quest) {
      this.zones.questDeck.addCard(this, definition);
    }

    const cards =
      difficulty === 'easy'
        ? scenario.sets.flatMap((e) => (e.easy ? e.easy : []))
        : scenario.sets.flatMap((e) => [...e.easy, ...e.normal]);

    for (const definition of cards) {
      this.zones.encounterDeck.addCard(this, definition);
    }
  }

  start() {
    this.zones.encounterDeck.shuffle();
    this.players.forEach((p) => p.zone.library.shuffle());
    this.players.forEach((p) => p.draw(6));
    this.cards
      .filter((c) => c.definition.front.type === 'hero')
      .forEach((c) => c.generateResources(1));
    this.zones.questDeck.topCard.move(this.zones.questArea);
    // // // TODO setup
    this.round();
  }

  round() {
    // TODO
  }
}
