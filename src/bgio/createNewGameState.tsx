import { core, decks } from '@card-engine-lisp/cards';
import {
  State,
  Game,
  StaticAgent,
  PlayerDeck,
  Scenario,
  toInstructions,
} from '@card-engine-lisp/engine';
import { NewGameParams } from './../game/types';

export function createNewGameState(setup: NewGameParams): State {
  const game = new Game(new StaticAgent([]));

  const players = setup.players
    .filter((p, i) => i < Number(setup.playerCount))
    .map((key) => decks[key]) as PlayerDeck[];

  const scenario = core.scenario[setup.scenario] as Scenario;

  for (const player of players) {
    game.addPlayer(player);
  }

  game.setupScenario(scenario, setup.difficulty);

  const state: State = {
    game: game.toJson(),
    stack: [],
    frames: [{}],
    instructions: toInstructions(`game.start()`),
  };

  return state;
}
