import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
} from '@mui/material';
import { LobbyClient } from 'boardgame.io/client';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { SettingsDialog } from '../settings/SettingsDialog';
import { useSettings } from '../settings/useSettings';
import { createNewGameState } from './LotrLCGClient';
import { Matches } from './Matches';
import { keys } from '@card-engine-lisp/engine';
import { SetupParams } from './../game/types';
import { GameSetupDialog } from './../game/GameSetupDialog';
import { useDialogs } from './../dialogs/DialogsContext';

export const GAME_NAME = 'LotrLCG';

export const LobbyPage = () => {
  const settings = useSettings();
  const navigate = useNavigate();
  const d = useDialogs();

  const lobby = useMemo(
    () => new LobbyClient({ server: settings.value.serverUrl }),
    [settings.value.serverUrl]
  );

  if (!settings.value.playerName) {
    return (
      <SettingsDialog
        defaults={settings.value}
        onSubmit={(v) => {
          settings.set(v);
        }}
        onClose={() => navigate('/')}
      />
    );
  }

  return (
    <Dialog open fullWidth>
      <DialogTitle>Game Lobby</DialogTitle>
      <Divider />
      <DialogContent>
        <Matches lobby={lobby} />
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={() => navigate('/')}>back</Button>
        <Button
          variant="contained"
          onClick={async () => {
            const params = await d.open({
              component: GameSetupDialog,
              action: async (r) => r,
            });

            const matchId = await createMatch(params, lobby);

            const credentials = await lobby.joinMatch(GAME_NAME, matchId, {
              playerName: settings.value.playerName,
            });

            const state: SetupParams = {
              type: 'join',
              playerID: credentials.playerID,
              matchID: matchId,
              credentials: credentials.playerCredentials,
              server: settings.value.serverUrl,
            };

            navigate('/game', { state });
          }}
        >
          Start new game
        </Button>
      </DialogActions>
    </Dialog>
  );
};

async function createMatch(setup: SetupParams, lobby: LobbyClient) {
  if (setup.type === 'join') {
    throw new Error('invalid params');
  }

  if (setup.type === 'load') {
    const state = JSON.parse(setup.state);
    const response = await lobby.createMatch(GAME_NAME, {
      numPlayers: keys(state.players).length,
      setupData: setup,
    });
    return response.matchID;
  }

  if (setup.type === 'new') {
    const state = createNewGameState(setup);

    const response = await lobby.createMatch('LotrLCG', {
      numPlayers: Number(setup.playerCount),
      setupData: {
        name: `todo name`,
        state,
      },
    });
    return response.matchID;
  }

  throw new Error('invalid params');
}
