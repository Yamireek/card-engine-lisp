import { State } from '@card-engine-liesp/engine';
import { BoardProps } from 'boardgame.io/react';

export type LotrLCGProps = BoardProps<State>;

export const LotrLCGBoard = (props: LotrLCGProps) => {
  return (
    <>
      {props.G.counter}
      <button
        onClick={() => {
          props.moves.test();
        }}
      >
        +1
      </button>
    </>
  );
};
