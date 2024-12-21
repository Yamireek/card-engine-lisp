import {
  InterpretedAgent,
  Interpreter,
  State,
} from '@card-engine-liesp/engine';
import { BoardProps } from 'boardgame.io/react';
import * as patch from 'fast-json-patch';
import ReactJson from 'react-json-view';
import { InterpreterDialogs } from './../interpreter/InterpreterDialogs';

export type LotrLCGProps = BoardProps<State>;

export const LotrLCGBoard = (props: LotrLCGProps) => {
  const origState = props.G;

  const interpreter = Interpreter.fromJson(
    JSON.parse(JSON.stringify(props.G)),
    new InterpretedAgent()
  );

  return (
    <>
      <button
        onClick={() => {
          interpreter.run();

          const newState = interpreter.toJson();

          const changes = patch.compare(origState, newState);

          props.moves.patch(changes);
        }}
      >
        run
      </button>
      <InterpreterDialogs interpreter={interpreter} />
      <ReactJson src={props.G} enableClipboard={false} />
    </>
  );
};
