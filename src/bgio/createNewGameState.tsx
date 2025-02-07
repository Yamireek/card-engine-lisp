import { core, decks } from '@card-engine-lisp/cards';
import {
  State,
  Game,
  PlayerDeck,
  Scenario,
  CardsRepo,
  Interpreter2,
  Card,
} from '@card-engine-lisp/engine';
import { NewGameParams } from './../game/types';

export function createNewGameState(
  setup: NewGameParams,
  repo: CardsRepo
): State {
  const scenario = core.scenario[setup.scenario] as Scenario;

  const players = setup.players
    .filter((p, i) => i < Number(setup.playerCount))
    .map((key) => decks[key]) as PlayerDeck[];

  const game = new Game(repo, {
    type: 'scenario',
    data: {
      extra: setup.extra,
      difficulty: setup.difficulty,
      scenario: scenario,
      players,
    },
  });

  const int = new Interpreter2(game);
  int.stack.push(game.begin());
  int.run();

  return int.toJSON();
}
