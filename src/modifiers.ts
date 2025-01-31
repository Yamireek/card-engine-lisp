/* eslint-disable @typescript-eslint/no-explicit-any */
import { cloneDeep, values } from 'lodash';
import {
  CardId,
  Difficulty,
  GameZoneType,
  HeroProps,
  Orientation,
  PlayerId,
  PlayerZoneType,
  PrintedProps,
  Side,
  Tokens,
  ZoneId,
  ZoneType,
} from '@card-engine-lisp/engine';

export type CardDefinition = {
  front: CardProps;
  back: CardProps;
  orientation: Orientation;
};

export type EncounterSet = {
  easy: CardDefinition[];
  normal: CardDefinition[];
};

export type PlayerDeck = {
  name: string;
  heroes: CardDefinition[];
  library: CardDefinition[];
};

export type Scenario = {
  name: string;
  quest: CardDefinition[];
  sets: EncounterSet[];
};

export type GameSetupData = {
  type: 'scenario';
  data: ScenarioSetupData;
};

export type ScenarioSetupData = {
  players: PlayerDeck[];
  scenario: Scenario;
  difficulty: Difficulty;
  extra: {
    resources: number;
    cards: number;
  };
};

export type Modifier = {
  property: string;
  operator: '+=' | '-=';
  value: number;
};

export type Ability = {
  type: 'modifier';
  description: string;
  code: (self: CardId) => Effect;
};

export type CardProps = PrintedProps & { abilities: Array<Ability> };

export type Effect = {
  type: 'card';
  target: (card: Card) => boolean;
  modifier: (card: Card) => Modifier;
};

export class Game {
  public nextId = 1;
  public player: Partial<Record<PlayerId, Player>> = {};
  public zone: Record<ZoneId, Zone> = {};
  public card: Record<CardId, Card> = {};

  public effects: Effect[] = [];

  constructor(setup: GameSetupData) {
    if (setup.type === 'scenario') {
      this.prepareScenario(setup.data.scenario, setup.data.difficulty);
      for (const playerDeck of setup.data.players) {
        this.addPlayer(playerDeck);
      }
    } else {
      throw new Error('Unknown setup type: ' + setup.type);
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
    this.addZone('removed');
    this.addZone('stagingArea');
    this.addZone('victoryDisplay');
  }

  addCard(def: CardDefinition, up: Side) {
    const id = this.nextId++;
    const card = new Card(this, id, def, up);
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

  recalculate() {
    for (const card of this.cards) {
      card.modifiers = [];
      card.props = cloneDeep(
        card.sideUp === 'front' ? card.def.front : card.def.back
      );
    }

    const effects: Effect[] = [];

    for (const card of this.cards) {
      for (const ability of card.props.abilities) {
        if (ability.type === 'modifier') {
          effects.push(ability.code(card.id));
        }
      }
    }

    for (const effect of [...effects, ...this.effects]) {
      for (const card of this.cards) {
        if (effect.target(card)) {
          const modifier = effect.modifier(card);
          card.modifiers.push(modifier);
          applyModifiers(card.props, card.modifiers);
        }
      }
    }
  }
}

export class Card {
  public props: CardProps;

  public modifiers: Modifier[] = [];

  public token: Tokens = { damage: 0, progress: 0, resource: 0 };

  constructor(
    public game: Game,
    public id: CardId,
    public def: CardDefinition,
    public sideUp: Side
  ) {
    this.props = cloneDeep(sideUp === 'front' ? def.front : def.back);
  }

  dealDamage(amount: number) {
    this.token.damage += amount;
    this.game.recalculate();
  }
}

export class Player {
  public zones: Zone[] = [];

  constructor(public game: Game, public id: PlayerId) {}
}

export class Zone {
  public cards: Card[] = [];

  constructor(game: Game, id: ZoneId, type: GameZoneType);
  constructor(game: Game, id: ZoneId, type: PlayerZoneType, owner: Player);
  constructor(
    public game: Game,
    public id: ZoneId,
    public type: GameZoneType | PlayerZoneType,
    public owner?: Player
  ) {}

  addCards(definitions: CardDefinition[], up: Side) {
    for (const def of definitions) {
      const card = this.game.addCard(def, up);
      this.cards.push(card);
    }
  }
}

export function applyModifiers(props: any, modifiers: Modifier[]) {
  for (const modifier of modifiers) {
    const { property, operator, value } = modifier;
    if (operator === '+=') {
      props[property] += value;
    } else if (operator === '-=') {
      props[property] -= value;
    }
  }
}

export function hero(
  props: Omit<HeroProps, 'type' | 'unique'>,
  ...abilities: Ability[]
): CardDefinition {
  return {
    front: {
      ...props,
      unique: true,
      sphere: [props.sphere],
      type: 'hero',
      abilities,
    },
    back: {
      type: 'player_back',
      traits: [],
      sphere: [],
      abilities: [],
    },
    orientation: 'portrait',
  };
}

const testHero = hero(
  {
    name: 'hero',
    attack: 1,
    defense: 1,
    willpower: 1,
    hitPoints: 6,
    sphere: 'lore',
    threatCost: 5,
    traits: [],
  },
  {
    type: 'modifier',
    description: '+1 attack for each damage token',
    code: (self) => {
      return {
        type: 'card',
        target: (c) => c.id === self,
        modifier: (c) => ({
          property: 'attack',
          operator: '+=',
          value: c.token.damage,
        }),
      };
    },
  }
);

const game = new Game({
  type: 'scenario',
  data: {
    scenario: {
      name: 'test',
      sets: [],
      quest: [],
    },
    players: [
      {
        name: 'test',
        heroes: [testHero],
        library: [],
      },
    ],
    difficulty: 'easy',
    extra: { resources: 0, cards: 0 },
  },
});

game.cards[0].dealDamage(5);
console.log(game.cards[0]);
