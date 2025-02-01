import { Instruction, valueToString } from '@card-engine-lisp/engine';
import { Chip, Avatar } from '@mui/material';

export const InstructionView = (props: { i: Instruction }) => {
  if (typeof props.i === 'string') {
    return <Chip label={props.i} />;
  }

  return (
    <Chip
      avatar={<Avatar>{props.i[0].slice(0, 1)}</Avatar>}
      label={props.i
        .slice(1)
        .flatMap((v) => valueToString(v as any))
        .join(', ')}
    />
  );
};
