import { CardId, CardProps } from './types';
import { Card } from './Card';
import { Entity } from './Entity';
import { values } from '../utils';
import { Agent } from '../agent/Agent';

export class Game extends Entity<'game'> {
  public nextId = 1;

  public card: Record<CardId, Card> = {};

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
      .forEach((ca) => ca.dealDamage(this.agent.chooseNumber(1, 5)));
  }
}
