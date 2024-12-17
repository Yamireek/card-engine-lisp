import { Flavor } from './types';
import { values } from './utils';

export type CardId = Flavor<number, 'card'>;

export abstract class Entity<T extends string> {
  constructor(public id: Flavor<number, T>, public entity: T) {}
}

export abstract class Agent {
  abstract chooseNumber(min: number, max: number): number;
}

export class StaticAgent extends Agent {
  constructor(public choices: any[]) {
    super();
  }

  override chooseNumber(): number {
    return this.choices.pop();
  }
}

export class Game extends Entity<'game'> {
  nextId = 1;

  card: Record<CardId, Card> = {};

  constructor(public agent: Agent) {
    super(0, 'game');
  }

  get cards() {
    return values(this.card);
  }

  addCard(props: CardProps) {
    const card = new Card(this, props);
    this.card[card.id] = card;
  }

  run() {
    this.cards
      .filter((cf) => cf.props.type === 'enemy')
      .forEach((ca) => ca.dealDamage(1));
  }
}

type CardType = 'hero' | 'ally' | 'enemy';

type CardProps = {
  name: string;
  type: CardType;
  att: number;
  def: number;
};

type Token = 'damage' | 'progress' | 'resource';

type Tokens = Record<Token, number>;

export class Card extends Entity<'card'> {
  token: Tokens = { damage: 0, progress: 0, resource: 0 };

  constructor(public game: Game, public props: CardProps) {
    super(game.nextId++, 'card');
  }

  dealDamage(amount: number) {
    this.token.damage = this.token.damage + amount;
  }
}
