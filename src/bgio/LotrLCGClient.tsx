import { Debug } from 'boardgame.io/debug';
import { Local, SocketIO } from 'boardgame.io/multiplayer';
import { Client } from 'boardgame.io/react';
import { LotrLCGBoard } from './LotrLCGBoard';
import { SetupParams } from './../game/types';
import { LoadingDialog } from './../dialogs/LoadingDialog';
import { LotrLCGame, State, toInstructions } from '@card-engine-liesp/engine';
import { p } from 'react-router/dist/development/fog-of-war-DLtn2OLr';

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
    const state = createNewGameState();

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

export function createNewGameState(): State {
  const state: State = {
    game: {
      nextId: 1,
      card: {
        1: {
          id: 1,
          props: {
            name: 'Enemy',
            type: 'enemy' as const,
            att: 1,
            def: 2,
          },
          tokens: {
            damage: 0,
            resource: 0,
            progress: 0,
          },
        },
      },
    },
    stack: [],
    vars: {},
    instructions: toInstructions('game.run()'),
  } as any;

  return state;
}
