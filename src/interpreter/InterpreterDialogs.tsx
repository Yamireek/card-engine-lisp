import { Interpreter } from '@card-engine-liesp/engine';
import { observer } from 'mobx-react-lite';
import { ChooseOptionDialog } from '../dialogs/ChooseOptionDialog';

export const InterpreterDialogs = observer(
  (props: { interpreter: Interpreter }) => {
    const choice = props.interpreter.choice;

    if (!choice) {
      return null;
    }

    return (
      <ChooseOptionDialog
        title={choice.title}
        min={choice.min}
        max={choice.max}
        choices={choice.options.map((o) => ({
          id: o.value,
          title: o.label,
        }))}
        onSubmit={(values) => {
          if (choice.max === 1) {
            props.interpreter.choose(values[0]);
          } else {
            props.interpreter.choose(values);
          }

          props.interpreter.run();
        }}
      />
    );
  }
);
