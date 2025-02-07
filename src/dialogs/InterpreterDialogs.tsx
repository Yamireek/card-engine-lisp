import { Interpreter } from '@card-engine-lisp/engine';
import { observer } from 'mobx-react-lite';
import { ChooseOptionDialog } from './ChooseOptionDialog';

export const InterpreterDialogs = observer(
  (props: { interpreter: Interpreter; onSubmit: () => void }) => {
    const nextAction = props.interpreter.stack[0];

    if (!nextAction || nextAction[0] !== 'CHOOSE') {
      return null;
    }

    const [, options] = nextAction;

    if (options.type === 'card') {
      const cards = props.interpreter.game
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter('CARD', options.filter as any)
        .filter((c) => props.interpreter.game.canCardExe(c, options.action));

      return (
        <ChooseOptionDialog
          title={options.label}
          min={options.min}
          max={options.max}
          choices={cards.map((card) => ({
            id: card.id,
            title: card.props.name ?? '',
          }))}
          onSubmit={(values) => {
            props.interpreter.stack.shift();
            props.interpreter.stack.unshift(['CARD', values, options.action]);
            props.onSubmit();
          }}
        />
      );
    } else {
      return null;
    }
  }
);
