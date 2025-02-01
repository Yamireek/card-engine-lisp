/* eslint-disable no-eval */
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
  ref: CardRef;
  front: CardProps;
  back: CardProps;
  orientation: Orientation;
};

export type EncounterSet = {
  easy: CardRef[];
  normal: CardRef[];
};

export type PlayerDeck = {
  name: string;
  heroes: CardRef[];
  library: CardRef[];
};

export type Scenario = {
  name: string;
  quest: CardRef[];
  sets: EncounterSet[];
};

export type ScenarioSetupData = {
  type: 'scenario';
  data: ScenarioSetup;
};

export type JSONSetupData = { type: 'json'; data: any };

export type GameSetupData = ScenarioSetupData | JSONSetupData;

export type ScenarioSetup = {
  players: PlayerDeck[];
  scenario: Scenario;
  difficulty: Difficulty;
  extra: {
    resources: number;
    cards: number;
  };
};

export type Modifier = (props: CardProps) => void;

export type Ability = {
  description: string;
  code: (self: Card) => Effect;
};

export type CardProps = PrintedProps & { abilities: Array<Ability> };

export type Effect = {
  type: 'card';
  target: Card | ((card: Card) => boolean);
  modifier: (card: Card) => (props: CardProps) => void;
};

export type CardRef = `${string}/${number}`;

export class CardsRepo {
  private nextId = 1;
  private defs: Record<CardRef, CardDefinition> = {};

  constructor(private set: string) {}

  add(def: Omit<CardDefinition, 'ref'> & { ref?: CardRef }): CardRef {
    const ref = `${this.set}/${this.nextId++}` as CardRef;
    def.ref = ref;
    this.defs[ref] = def as CardDefinition;
    return ref;
  }

  get(ref: CardRef): CardDefinition {
    return this.defs[ref];
  }
}

const cards = new CardsRepo('test');

export class Game {
  public nextId = 1;
  public player: Partial<Record<PlayerId, Player>> = {};
  public zone: Record<ZoneId, Zone> = {};
  public card: Record<CardId, Card> = {};
  public effects: Effect[] = [];

  toJSON(): object {
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
      if (!cards) {
        throw new Error('missing cards repository');
      }

      this.nextId = setup.data.nextId;
      for (const zone of setup.data.zones) {
        this.zone[zone.id] = new Zone(this, zone.id, zone.type);
      }

      for (const player of setup.data.players) {
        (this.player as any)[player.id as any] = new Player(this, player.id);
      }

      for (const card of setup.data.cards) {
        this.card[card.id] = new Card(
          this,
          card.id,
          cards.get(card.def),
          card.up
        );
        this.card[card.id].token = card.token;
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
    this.addZone('removed');
    this.addZone('stagingArea');
    this.addZone('victoryDisplay');
  }

  addCard(ref: CardRef, up: Side) {
    const id = this.nextId++;
    const card = new Card(this, id, this.repo.get(ref), up);
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

export class Card {
  public props: CardProps;

  public modifiers: Modifier[] = [];

  public token: Tokens = { damage: 0, progress: 0, resource: 0 };

  toJSON(): any {
    return {
      id: this.id,
      def: this.def.ref,
      up: this.up,
      token: this.token,
    };
  }

  constructor(
    public game: Game,
    public id: CardId,
    public def: CardDefinition,
    public up: Side
  ) {
    this.props = cloneDeep(up === 'front' ? def.front : def.back);
  }

  dealDamage(amount: number) {
    this.token.damage += amount;
    this.game.recalculate();
  }
}

export class Player {
  public zones: Zone[] = [];

  toJSON(): any {
    return { id: this.id };
  }

  constructor(public game: Game, public id: PlayerId) {}
}

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

export function hero(
  props: Omit<HeroProps, 'type' | 'unique'>,
  ...abilities: Ability[]
): Omit<CardDefinition, 'ref'> {
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

const testHero = cards.add(
  hero(
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
      description: '+1 attack for each damage token',
      code: (self) => {
        return {
          type: 'card',
          target: self,
          modifier: (card) => (p) => {
            if (p.attack !== undefined) {
              p.attack += card.token.damage;
            }
          },
        };
      },
    }
  )
);

const game = new Game(cards, {
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

game.effects.push({
  type: 'card',
  target: () => true,
  modifier: (card) => (props) => (props.defense = 0),
});

game.recalculate();
game.recalculate();

console.log(game.cards[0]);

export function stringify(obj: object) {
  const placeholder = '____PLACEHOLDER____';
  const fns: Array<any> = [];
  let json = JSON.stringify(
    obj,
    function (key, value) {
      if (typeof value === 'function') {
        fns.push(value);
        return placeholder;
      }
      return value;
    },
    2
  );
  json = json.replace(new RegExp('"' + placeholder + '"', 'g'), function (_) {
    return fns.shift();
  });

  return `(${json})`;
}

console.log(game.toJSON());

console.log(
  new Game(cards, {
    type: 'json',
    data: game.toJSON(),
  })
);
