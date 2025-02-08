/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Card,
  EntityAction,
  Game,
  GameSetupData,
  Interpreter,
} from '@card-engine-lisp/engine';
import { cards } from './repo';

export class TestGame {
  public int: Interpreter;
  public game: Game;

  constructor(setup: GameSetupData) {
    this.game = new Game(cards, setup);
    this.int = new Interpreter(this.game);
  }

  getCard(name: string) {
    const cards = this.game.filter('CARD', (c) => c.props.name === name);
    return new CardProxy(cards[0], this.int);
  }
}

export class CardProxy {
  constructor(private card: Card, private int: Interpreter) {}

  get props() {
    return this.card.props;
  }

  exe(action: EntityAction<Card>) {
    this.int.exe(['CARD', this.card.id as any, action]);
    this.card.game.recalculate();
  }
}
