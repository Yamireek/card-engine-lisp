import { useNavigate } from 'react-router';
import { GameSetupDialog } from './GameSetupDialog';

export const SingleSetupPage = () => {
  const navigate = useNavigate();

  return (
    <GameSetupDialog
      onSubmit={(setup) => navigate('/game', { state: setup })}
      onClose={() => navigate('/')}
    />
  );
};
