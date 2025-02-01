import { CardId, PlayerId, ZoneId } from './types';
import {
  CardRef,
  Effect,
  GameSetupData,
  PlayerDeck,
  Scenario,
} from '../state/GameSetupData';
import {
  Difficulty,
  GameZoneType,
  PlayerZoneType,
  Side,
  ZoneType,
} from '../state';
import { Player } from './Player';
import { Zone } from './Zone';
import { Card } from './Card';
import { stringify, values } from '../utils';
import { CardsRepo } from '../repo';
import { cloneDeep } from 'lodash';

export class Game {
  public nextId = 1;
  public player: Partial<Record<PlayerId, Player>> = {};
  public zone: Record<ZoneId, Zone> = {};
  public card: Record<CardId, Card> = {};
  public effects: Effect[] = [];

  toJSON(): any {
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
      this.nextId = setup.data.nextId;

      for (const player of setup.data.players) {
        (this.player as any)[player.id as any] = new Player(this, player.id);
      }

      for (const card of setup.data.cards) {
        this.card[card.id] = new Card(this, card.id, card.ref, card.up);
        this.card[card.id].token = card.token;
      }

      for (const zone of setup.data.zones) {
        const newZone = new Zone(this, zone.id, zone.type);

        if (zone.owner) {
          newZone.owner = (this.player as any)[zone.owner as any];
        }

        for (const cardId of zone.cards) {
          newZone.cards.push(this.card[cardId]);
        }

        this.zone[zone.id] = newZone;
      }

      for (const effect of setup.data.effects) {
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

  getZone(type: GameZoneType) {
    return this.zones.find((z) => z.type === type && !z.owner)!;
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
      const targets =
        effect.target instanceof Card
          ? [effect.target]
          : this.cards.filter(effect.target);

      for (const card of targets) {
        const modify = effect.modifier(card);
        card.modifiers.push(modify);
        modify(card.props);
      }
    }
  }
}
