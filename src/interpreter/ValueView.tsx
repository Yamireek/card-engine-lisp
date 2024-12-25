import { Value, valueToString } from '@card-engine-lisp/engine';
import { Chip, Avatar, Button } from '@mui/material';

export const ValueView = (props: { v: Value }) => {
  if (typeof props.v === 'object') {
    if ('type' in props.v) {
      return (
        <Chip
          avatar={<Avatar>{props.v.type.slice(0, 1)}</Avatar>}
          label={valueToString(props.v)}
        />
      );
    } else {
      return (
        <Button
          onClick={() => {
            console.log(props.v);
          }}
        >
          unknown object
        </Button>
      );
    }
  } else {
    const type =
      typeof props.v === 'number'
        ? 'N'
        : typeof props.v === 'boolean'
        ? 'B'
        : 'S';
    return (
      <Chip avatar={<Avatar>{type}</Avatar>} label={valueToString(props.v)} />
    );
  }
};
