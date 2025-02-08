/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Action,
  Card,
  EntityAction,
  Game,
  GameSetupData,
  Interpreter,
  PlayerId,
} from '@card-engine-lisp/engine';
import { cards } from './repo';

export class TestGame {
  public int: Interpreter;
  public game: Game;

  constructor(setup: GameSetupData) {
    this.game = new Game(cards, setup);
    this.int = new Interpreter(this.game);
    this.int.run();
  }

  getCard(name: string) {
    const cards = this.game.filter('CARD', (c) => c.props.name === name);
    return new CardProxy(cards[0], this);
  }

  getPlayer(id: PlayerId) {
    return this.game.player[id];
  }

  exe(action: Action) {
    this.int.exe(action);
    this.game.recalculate();
  }

  get actions() {
    return this.game.cards.flatMap((card) =>
      card.props.actions
        .filter((a) => this.game.canEntityExe('CARD', card, a.action(card)))
        .map((a) => ({
          card,
          desc: a.desc,
          action: a.action(card),
        }))
    );
  }

  do(desc: string) {
    const actions = this.actions.filter((a) => a.desc === desc);
    if (actions.length === 1) {
      const action = actions[0];
      this.run(['CARD', action.card.id as any, action.action]);
    } else {
      throw new Error('not found 1 action');
    }
  }

  run(action: Action) {
    this.int.stack.unshift(action);
    while (true) {
      this.int.run();
      const next = this.int.stack[0];
      if (!next) {
        return;
      }

      if (next[0] === 'CHOOSE') {
        const options = next[1];
        if (options.type === 'player') {
          const targets = this.game.filter('PLAYER', options.filter);
          if (targets.length === 1 && options.min == 1 && options.max === 1) {
            this.int.stack.shift();
            this.int.stack.unshift([
              'PLAYER',
              targets.map((t) => t.id),
              options.action,
            ]);
          }
        } else {
          return;
        }
      }
    }
  }
}

export class CardProxy {
  constructor(private card: Card, private test: TestGame) {}

  get props() {
    return this.card.props;
  }

  exe(action: EntityAction<Card>) {
    this.test.run(['CARD', this.card.id as any, action]);
  }
}
