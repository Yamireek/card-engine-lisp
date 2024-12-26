import { Agent } from '../agent';
import { InterpretedAgent } from '../agent/InterpretedAgent';
import { StaticAgent } from '../agent/StaticAgent';
import { Interpreter } from '../interpreter';
import { toInstructions } from '../utils';
import { Game } from './Game';

class TestGame extends Game {
  public counter = 1;

  constructor(agent: Agent) {
    super(agent);
  }

  runTest(args: { a: number; b: number; c: { d: number } }) {
    this.counter = this.agent.chooseNumber(1, 5) + args.a + args.b + args.c.d;
  }
}

it('run method', () => {
  const game = new TestGame(new StaticAgent([2]));
  game.runTest({ a: 1, b: 2, c: { d: 3 } });
  expect(game.counter).toBe(8);
});

it('interpret method', () => {
  const game = new TestGame(new StaticAgent([2]));
  const interpreter = new Interpreter(
    toInstructions('game.runTest({ a: 1, b: 2, c: { d: 3 } })'),
    game
  );
  interpreter.run();
  expect(game.counter).toBe(8);
});

it('real agent', () => {
  const game = new TestGame(new InterpretedAgent());

  const interpreter = new Interpreter(toInstructions('game.runTest()'), game);
  const result = interpreter.run();

  expect(game.counter).toBe(1);
  expect(result).toHaveProperty('type', 'CHOICE');
});
