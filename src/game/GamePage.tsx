import { useLocation } from 'react-router';
import { LotrLCGClient } from './../bgio/LotrLCGClient';

export const GamePage = () => {
  const location = useLocation();

  const setup = location.state;

  const Client = LotrLCGClient(setup);

  if (setup.type === 'join') {
    return (
      <Client
        matchID={setup.matchID}
        playerID={setup.playerID}
        credentials={setup.credentials}
      />
    );
  }

  return <Client playerID="0" />;
};
