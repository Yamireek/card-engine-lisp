import { Button, LinearProgress, List, ListItem } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { LobbyClient } from 'boardgame.io/client';
import { useNavigate } from 'react-router';
import { useSettings } from '../settings/useSettings';
import { GAME_NAME } from './LobbyPage';
import { SetupParams } from './../game/types';

export const Matches = (props: { lobby: LobbyClient }) => {
  const navigate = useNavigate();
  const settings = useSettings();

  const matchesQ = useQuery({
    queryKey: ['matches'],
    queryFn: () => props.lobby.listMatches(GAME_NAME),
  });

  if (matchesQ.isPending) {
    return <LinearProgress />;
  }

  if (matchesQ.isError) {
    return <LinearProgress />;
  }

  return (
    <List>
      {matchesQ.data.matches.map((m) => (
        <ListItem key={m.matchID}>
          {m.setupData.name}
          {
            <Button
              variant="contained"
              disabled={!m.players.some((p) => !p.name)}
              onClick={async () => {
                const result = await props.lobby.joinMatch(
                  GAME_NAME,
                  m.matchID,
                  {
                    playerName: 'player',
                  }
                );

                const state: SetupParams = {
                  type: 'join',
                  playerID: result.playerID,
                  matchID: m.matchID,
                  credentials: result.playerCredentials,
                  server: settings.value.serverUrl,
                };

                navigate('/game', { state });
              }}
            >
              join
            </Button>
          }
        </ListItem>
      ))}
    </List>
  );
};
