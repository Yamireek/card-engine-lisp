import { Game, Interpreter, PlayerId, State } from '@card-engine-lisp/engine';
import { createContext, useContext } from 'react';

export const StateContext = createContext<{
  game: Game;
  int: Interpreter;
  state: State;
  playerId?: PlayerId;
  undo: () => void;
  redo: () => void;
  leave: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}>({} as any);

export function useGameState() {
  return useContext(StateContext);
}
