import { useContext } from 'react';
import { StateContext } from './StateContext';
import { GameInfo } from './GameInfo';
import {
  Stack,
  Paper,
  IconButton,
  Icon,
  Typography,
} from '@mui/material';

export const LotrLCGInfo = () => {
  const { game, state, playerId, undo, redo, leave } = useContext(StateContext);

  const totalWillpower = 1; // TODO

  const totalThreat = 1; // TODO

  const currentProgress = 1; // TODO

  const targetProgress = 1; // TODO

  return (
    <div
      style={{
        position: 'absolute',
        width: 372,
        margin: 4,
        zIndex: 10,
        right: 0,
        height: '100%',
        paddingBottom: 80,
        pointerEvents: 'none',
      }}
    >
      <Stack direction="column" spacing={1} height="100%">
        <GameInfo
          players={game.players.map((p) => ({
            id: p.id,
            threat: 0, // TODO p.thread,
            state: 'active', // TODO p.eliminated ? 'eliminated' : 'active',
          }))}
          progress={{ current: currentProgress, target: targetProgress }}
          showPlayer={playerId}
          threat={totalThreat}
          willpower={totalWillpower}
        />
        <Paper>
          <Stack direction="row" style={{ pointerEvents: 'auto' }}>
            <IconButton
              onClick={() => {
                localStorage.setItem('saved_state', JSON.stringify(state));
              }}
            >
              <Icon>save</Icon>
            </IconButton>
            <IconButton
              onClick={() => {
                const value = localStorage.getItem('saved_state');
                if (!value) {
                  return;
                }
                try {
                  //   const loaded = JSON.parse(value);
                  //   moves.load(loaded);
                  throw new Error('Not implemented'); // TODO
                } catch (error) {
                  if (error instanceof Error) {
                    console.log(error.message);
                  }
                }
              }}
            >
              <Icon>upload</Icon>
            </IconButton>
            <IconButton
              onClick={() => {
                localStorage.removeItem('saved_state');
              }}
            >
              <Icon>delete</Icon>
            </IconButton>
            <IconButton
              onClick={() => {
                console.log('game', game);
                console.log('state', state);
              }}
            >
              <Icon>bug_report</Icon>
            </IconButton>

            <IconButton
              onClick={() => {
                undo();
              }}
            >
              <Icon>undo</Icon>
            </IconButton>

            <IconButton
              onClick={() => {
                redo();
              }}
            >
              <Icon>redo</Icon>
            </IconButton>

            <IconButton
              onClick={() => {
                leave();
              }}
            >
              <Icon>logout</Icon>
            </IconButton>
          </Stack>
        </Paper>
        {/* {state.modifiers.length > 0 && (
          <Paper
            style={{ padding: 4, overflow: 'auto', pointerEvents: 'auto' }}
          >
            <Typography variant="caption">Temporary effects</Typography>
            {state.modifiers.map((m, i) => {
              const title = view.cards[m.source].props.name ?? '';
              return (
                <Fragment key={title + i}>
                  <Tooltip title={title} placement="left">
                    <Typography>{getModifierText(m, state, view)}</Typography>
                  </Tooltip>
                  <Divider variant="fullWidth" />
                </Fragment>
              );
            })}
          </Paper>
        )} */}
        <Paper style={{ padding: 4, overflow: 'auto', pointerEvents: 'auto' }}>
          <Typography variant="caption">Possible actions</Typography>
          {/* {actions.map((a, i) => {
            const title = view.cards[a.card].props.name ?? '';
            return (
              <Fragment key={title + i}>
                <Tooltip title={title} placement="left">
                  <Typography>{a.description}</Typography>
                </Tooltip>
                <Divider variant="fullWidth" />
              </Fragment>
            );
          })} */}
        </Paper>
      </Stack>
    </div>
  );
};
