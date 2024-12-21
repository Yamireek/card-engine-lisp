import { ActivePlayers } from 'boardgame.io/core';
import type { Game } from 'boardgame.io';
import { State } from '../entity/types';

export function LotrLCGame(
  setupClient?: State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Game<State, any, { name: string; state: State }> {
  return {
    name: 'LotrLCG',
    setup: (_, setupServer) => {
      if (setupServer) {
        return setupServer.state;
      }

      if (setupClient) {
        return setupClient;
      }

      return { counter: 0 };
    },
    minPlayers: 1,
    maxPlayers: 4,
    moves: {
      test: (ctx: any) => {
        ctx.G.counter += 1;
      },
    },
    turn: {
      activePlayers: ActivePlayers.ALL,
    },
    endIf: ({ G }) => {
      if (G.result?.win) {
        return {
          score: 100 / G.result.score,
          winner: '0',
        };
      }

      return G.result;
    },
  };
}
