import { InterpretedAgent, Interpreter, State } from '@card-engine-lisp/engine';
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

export type LotrLCGProps = BoardProps<State>;

// export const LotrLCGBoard = (props: LotrLCGProps) => {
//   const interpreter = useMemo(
//     () => Interpreter.fromJson(props.G, new InterpretedAgent()),
//     [props.G]
//   );

//   return (
//     <>
//       <button
//         onClick={() => {
//           console.time();
//           interpreter.run();
//           const newState = interpreter.toJson();
//           const changes = patch.compare(props.G, newState);
//           console.log('changes', changes);
//           props.moves.patch(changes);
//           console.timeEnd();
//         }}
//       >
//         run
//       </button>
//       <InterpreterDialogs
//         interpreter={interpreter}
//         onChoice={(choice) => {
//           console.time();
//           interpreter.choose(choice);
//           interpreter.run();
//           const newState = interpreter.toJson();
//           const changes = patch.compare(props.G, newState);
//           console.log('changes', changes);
//           props.moves.patch(changes);
//           console.timeEnd();
//         }}
//       />
//       <ReactJson
//         src={props.G}
//         enableClipboard={false}
//         collapsed={2}
//         theme="monokai"
//       />
//     </>
//   );
// };

export const LotrLCGBoard = (props: LotrLCGProps) => {
  const settings = useSettings();
  const navigate = useNavigate();

  const interpreter = useMemo(
    () => Interpreter.fromJson(props.G, new InterpretedAgent()),
    [props.G]
  );

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
        state: props.G,
        playerId:
          props.isMultiplayer && props.playerID
            ? validPlayerId(props.playerID)
            : undefined,
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
        <GameDisplay />
      </DetailProvider>
    </StateContext.Provider>
  );
};
