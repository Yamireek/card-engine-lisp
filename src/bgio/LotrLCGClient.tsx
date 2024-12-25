import { Debug } from 'boardgame.io/debug';
import { Local, SocketIO } from 'boardgame.io/multiplayer';
import { Client } from 'boardgame.io/react';
import { LotrLCGBoard } from './LotrLCGBoard';
import { NewGameParams, SetupParams } from './../game/types';
import { LoadingDialog } from './../dialogs/LoadingDialog';
import {
  Game,
  LotrLCGame,
  PlayerDeck,
  Scenario,
  State,
  StaticAgent,
  toInstructions,
} from '@card-engine-lisp/engine';
import { core, decks } from '@card-engine-lisp/cards';

export function LotrLCGClient(setup: SetupParams) {
  if (setup.type === 'load') {
    return Client({
      game: LotrLCGame(JSON.parse(setup.state)),
      board: LotrLCGBoard,
      numPlayers: 1,
      debug: { collapseOnLoad: true, impl: Debug },
      loading: LoadingDialog,
    });
  }

  if (setup.type === 'join') {
    return Client({
      game: LotrLCGame(),
      board: LotrLCGBoard,
      numPlayers: 1,
      multiplayer: SocketIO({ server: setup.server }),
      debug: { collapseOnLoad: true, impl: Debug },
      loading: LoadingDialog,
    });
  }

  if (setup.type === 'new') {
    const state = createNewGameState(setup);

    return Client({
      game: LotrLCGame(state),
      board: LotrLCGBoard,
      numPlayers:
        setup.server && setup.server !== 'local'
          ? Number(setup.playerCount)
          : 1,
      multiplayer:
        setup.server === 'local'
          ? Local({ persist: true })
          : setup.server
          ? SocketIO({ server: setup.server.url })
          : undefined,
      debug: { collapseOnLoad: true, impl: Debug },
      loading: LoadingDialog,
    });
  }

  throw new Error('not implemented');
}

export function createNewGameState(setup: NewGameParams): State {
  const game = new Game(new StaticAgent([]));

  const players = setup.players
    .filter((p, i) => i < Number(setup.playerCount))
    .map((key) => (decks as any)[key]) as PlayerDeck[];

  const scenario = (core.scenario as any)[setup.scenario] as Scenario;

  for (const player of players) {
    game.addPlayer(player);
  }

  game.setupScenario(scenario, setup.difficulty);

  const state: State = {
    game: game.toJson(),
    stack: [],
    vars: {},
    instructions: toInstructions(`game.start()`),
  };

  return state;
}
