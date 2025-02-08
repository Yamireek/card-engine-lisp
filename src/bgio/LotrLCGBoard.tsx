/* eslint-disable no-eval */
import { Game, Interpreter, State } from '@card-engine-lisp/engine';
import { BoardProps } from 'boardgame.io/react';
import { useEffect, useMemo } from 'react';
import { LobbyClient } from 'boardgame.io/client';
import { useNavigate } from 'react-router';
import { useSettings } from './../settings/useSettings';
import { GAME_NAME } from './LobbyPage';
import { validPlayerId } from './validPlayerId';
import { StateContext } from './../game/StateContext';
import { DetailProvider } from './../game/DetailContext';
import { GameDisplay } from './../game/GameDisplay';
import patch from 'fast-json-patch';
import { InterpreterDialogs } from '../dialogs/InterpreterDialogs';
import { cards } from '@card-engine-lisp/cards';

export type LotrLCGProps = BoardProps<State>;

export const LotrLCGBoard = (props: LotrLCGProps) => {
  const settings = useSettings();
  const navigate = useNavigate();
  const playerId = validPlayerId(props.playerID);

  const interpreter = useMemo(() => {
    const game = new Game(
      cards,
      {
        type: 'json',
        data: props.G.game,
      },
      true
    );
    const int = new Interpreter(game, true);
    int.stack = props.G.stack.map((s) => eval(s));
    return int;
  }, [props.G]);

  useEffect(() => {
    const value = localStorage.getItem('saved_state');
    if (!value) {
      return;
    }
    try {
      const loaded = JSON.parse(value);
      props.moves.load(loaded);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StateContext.Provider
      value={{
        game: interpreter.game,
        int: interpreter,
        state: props.G,
        playerId: props.isMultiplayer && playerId ? playerId : undefined,
        undo: props.undo,
        redo: props.redo,
        leave: () => {
          if (props.isMultiplayer) {
            const lobby = new LobbyClient({ server: settings.value.serverUrl });

            if (props.playerID && props.credentials) {
              lobby.leaveMatch(GAME_NAME, props.matchID, {
                playerID: props.playerID,
                credentials: props.credentials,
              });
            }

            navigate('/lobby');
          } else {
            navigate('/single');
          }
        },
      }}
    >
      <DetailProvider>
        <InterpreterDialogs
          interpreter={interpreter}
          onSubmit={() => {
            console.time();
            interpreter.run();
            const newState = interpreter.toJSON();
            const changes = patch.compare(props.G, newState);
            console.log('changes', changes);
            props.moves.patch(changes);
            console.timeEnd();
          }}
        />
        <GameDisplay />
      </DetailProvider>
    </StateContext.Provider>
  );
};
