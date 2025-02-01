/* eslint-disable @typescript-eslint/no-explicit-any */
import { Interpreter, Value } from '@card-engine-lisp/engine';
import { observer } from 'mobx-react-lite';
import { ChooseOptionDialog } from '../dialogs/ChooseOptionDialog';

export const InterpreterDialogs = observer(
  (props: {
    interpreter: Interpreter;
    onChoice: (v: Value | Value[]) => void;
  }) => {
    const choice = props.interpreter.choice;

    if (!choice) {
      return null;
    }

    return (
      <ChooseOptionDialog<Value>
        title={choice.title}
        min={choice.min}
        max={choice.max}
        choices={choice.options.map((o: any) => ({
          id: o.value,
          title: o.label,
        }))}
        onSubmit={(values) => {
          if (choice.max === 1) {
            props.onChoice(values[0]);
          } else {
            props.onChoice(values);
          }
        }}
      />
    );
  }
);
