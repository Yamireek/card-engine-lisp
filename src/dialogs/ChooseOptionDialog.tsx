import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2,
  ListItemButton,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { MinimizeDialogButton } from './MinimizeDialogButton';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const ChooseOptionDialog = <T extends unknown>(props: {
  title: string;
  min?: number;
  max?: number;
  choices: {
    title: string;
    image?: {
      src: string;
      width: number;
      height: number;
    };
    id: T;
  }[];
  onSubmit: (ids: T[]) => void;
  onMinimize?: () => void;
}) => {
  const [selected, setSelected] = useState<T[]>([]);

  const single = props.max === 1;

  return (
    <Dialog open={true} maxWidth="md">
      <DialogTitle>{props.title}</DialogTitle>
      <MinimizeDialogButton onMinimize={props.onMinimize} />
      <DialogContent>
        <Grid2 container spacing={1} justifyContent="space-evenly">
          {props.choices.map((o, i) => (
            <Grid2 key={i} size={{ xs: !o.image ? 12 : 'auto' }}>
              <ListItemButton
                key={i}
                style={{ flex: '0 0 auto' }}
                disabled={
                  !selected.includes(o.id) &&
                  props.max !== undefined &&
                  selected.length >= props.max
                }
                onClick={(e) => {
                  if (single) {
                    props.onSubmit([o.id]);
                  } else {
                    e.stopPropagation();
                    const filtered = selected.includes(o.id)
                      ? selected.filter((s) => s !== o.id)
                      : [...selected, o.id];

                    setSelected(filtered);
                  }
                }}
              >
                {o.image?.src ? (
                  <img
                    alt=""
                    src={o.image?.src}
                    style={{
                      width: o.image?.width,
                      height: o.image?.height,
                      position: 'relative',
                      opacity: single || selected.includes(o.id) ? 1 : 0.5,
                    }}
                  />
                ) : (
                  <Typography
                    style={{
                      opacity: single || selected.includes(o.id) ? 1 : 0.5,
                    }}
                  >
                    {o.title}
                  </Typography>
                )}
              </ListItemButton>
            </Grid2>
          ))}
        </Grid2>
      </DialogContent>
      {!single && (
        <DialogActions>
          <Button
            disabled={props.min !== undefined && selected.length < props.min}
            onClick={() => {
              props.onSubmit(selected);
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};
