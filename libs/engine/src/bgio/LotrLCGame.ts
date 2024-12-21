import { ActivePlayers } from 'boardgame.io/core';
import type { Game } from 'boardgame.io';
import * as jsonpatch from 'fast-json-patch';
import { State } from '../state/State';
import { Operation } from 'fast-json-patch';

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

      throw new Error('need state from client or server');
    },
    minPlayers: 1,
    maxPlayers: 4,
    moves: {
      patch: (ctx: any, patches: Operation[]) => {
        jsonpatch.applyPatch(ctx.G, patches);
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
