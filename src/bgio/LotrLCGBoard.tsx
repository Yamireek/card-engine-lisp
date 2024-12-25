import { InterpretedAgent, Interpreter, State } from '@card-engine-lisp/engine';
import { BoardProps } from 'boardgame.io/react';
import * as patch from 'fast-json-patch';
import ReactJson from 'react-json-view';
import { InterpreterDialogs } from './../interpreter/InterpreterDialogs';
import { useMemo } from 'react';

export type LotrLCGProps = BoardProps<State>;

export const LotrLCGBoard = (props: LotrLCGProps) => {
  const interpreter = useMemo(
    () => Interpreter.fromJson(props.G, new InterpretedAgent()),
    [props.G]
  );

  return (
    <>
      <button
        onClick={() => {
          console.time();
          interpreter.run();
          const newState = interpreter.toJson();
          const changes = patch.compare(props.G, newState);
          console.log('changes', changes);
          props.moves.patch(changes);
          console.timeEnd();
        }}
      >
        run
      </button>
      <InterpreterDialogs
        interpreter={interpreter}
        onChoice={(choice) => {
          console.time();
          interpreter.choose(choice);
          interpreter.run();
          const newState = interpreter.toJson();
          const changes = patch.compare(props.G, newState);
          console.log('changes', changes);
          props.moves.patch(changes);
          console.timeEnd();
        }}
      />
      <ReactJson
        src={props.G}
        enableClipboard={false}
        collapsed={2}
        theme="monokai"
      />
    </>
  );
};
