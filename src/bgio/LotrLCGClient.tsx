import { Debug } from 'boardgame.io/debug';
import { Local, SocketIO } from 'boardgame.io/multiplayer';
import { Client } from 'boardgame.io/react';
import { LotrLCGBoard } from './LotrLCGBoard';
import { SetupParams } from './../game/types';
import { LoadingDialog } from './../dialogs/LoadingDialog';
import { CardsRepo, LotrLCGame } from '@card-engine-lisp/engine';
import { createNewGameState } from './createNewGameState';

export function LotrLCGClient(setup: SetupParams, repo: CardsRepo) {
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
    const state = createNewGameState(setup, repo);

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
