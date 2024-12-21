import { InterpretedAgent } from '../agent/InterpretedAgent';
import { StaticAgent } from '../agent/StaticAgent';
import { Interpreter } from '../interpreter';
import { toInstructions } from '../utils';
import { Game } from './Game';

it('create game', () => {
  const game = new Game(new StaticAgent([]));
  game.addCard({ name: 'HERO', type: 'hero', att: 2, def: 2 });
  game.addCard({ name: 'ALLY', type: 'ally', att: 1, def: 1 });
  game.addCard({ name: 'ENEMY', type: 'enemy', att: 3, def: 3 });

  expect(game.cards[0].props.name).toBe('HERO');
});

it('run method', () => {
  const game = new Game(new StaticAgent([1]));
  game.addCard({ name: 'HERO', type: 'hero', att: 2, def: 2 });
  game.addCard({ name: 'ALLY', type: 'ally', att: 1, def: 1 });
  game.addCard({ name: 'ENEMY', type: 'enemy', att: 3, def: 3 });

  game.run();

  expect(game.card[1].token.damage).toBe(0);
  expect(game.card[2].token.damage).toBe(0);
  expect(game.card[3].token.damage).toBe(1);
});

it('interpret method', () => {
  const game = new Game(new StaticAgent([3]));
  game.addCard({ name: 'HERO', type: 'hero', att: 2, def: 2 });
  game.addCard({ name: 'ALLY', type: 'ally', att: 1, def: 1 });
  game.addCard({ name: 'ENEMY', type: 'enemy', att: 3, def: 3 });

  const interpreter = new Interpreter(toInstructions('game.run()'), game);
  interpreter.run();

  expect(game.card[1].token.damage).toBe(0);
  expect(game.card[2].token.damage).toBe(0);
  expect(game.card[3].token.damage).toBe(3);
});

it('real agent', () => {
  const game = new Game(new InterpretedAgent());
  game.addCard({ name: 'HERO', type: 'hero', att: 2, def: 2 });
  game.addCard({ name: 'ALLY', type: 'ally', att: 1, def: 1 });
  game.addCard({ name: 'ENEMY', type: 'enemy', att: 3, def: 3 });

  const interpreter = new Interpreter(toInstructions('game.run()'), game);
  interpreter.run();

  expect(game.card[1].token.damage).toBe(0);
  expect(game.card[2].token.damage).toBe(0);
  expect(game.card[3].token.damage).toBe(3);
});
