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

  runTest() {
    this.counter = this.agent.chooseNumber(1, 5);
  }
}

it('run method', () => {
  const game = new TestGame(new StaticAgent([2]));
  game.runTest();
  expect(game.counter).toBe(2);
});

it('interpret method', () => {
  const game = new TestGame(new StaticAgent([2]));
  const interpreter = new Interpreter(toInstructions('game.runTest()'), game);
  interpreter.run();
  expect(game.counter).toBe(2);
});

it('real agent', () => {
  const game = new TestGame(new InterpretedAgent());
  game.addCard({ name: 'HERO', type: 'hero', att: 2, def: 2 });
  game.addCard({ name: 'ALLY', type: 'ally', att: 1, def: 1 });
  game.addCard({ name: 'ENEMY', type: 'enemy', att: 3, def: 3 });

  const interpreter = new Interpreter(toInstructions('game.runTest()'), game);
  const result = interpreter.run();

  expect(game.counter).toBe(1);
  expect(result).toHaveProperty('type', 'CHOICE');
});
