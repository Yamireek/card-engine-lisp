import { useContext, useEffect } from 'react';
import { StateContext, useGameState } from './StateContext';
import { LotrLCGInfo } from './LotrLCGInfo';
import { GameSceneLoader } from './GameScene';
import { Board3d } from './Board3d';

export const GameDisplay = () => {
  const { state } = useContext(StateContext);
  const game = useGameState();
  //   const textureUrls = useMemo(
  //     () => [...staticUrls, ...getAllImageUrls(state)],
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //     []
  //   );

  useEffect(() => {
    const handleUnload = () => {
      game.leave();
    };
    window.addEventListener('unload', handleUnload);
    return () => {
      window.removeEventListener('unload', handleUnload);
    };
  }, [game]);

  return (
    // <FloatingCardsProvider>
    <div style={{ width: '100%', height: '100vh' }}>
      <LotrLCGInfo />
      <div style={{ width: '100%', height: '100%' }}>
        {/* <TexturesProvider textures={textureUrls}> */}
        <GameSceneLoader angle={20} rotation={0} perspective={1500}>
          {/* <FloatingCards /> */}
          <group rotation={[-Math.PI / 2, 0, 0]}>
            <Board3d />
            {/* {playerIds.map((id) => (
                  <PlayerAreas key={id} player={id} />
                ))} */}

            {/* <GameAreas playerCount={Object.keys(state.players).length} /> */}
          </group>
        </GameSceneLoader>
        {/* </TexturesProvider> */}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: -100,
          width: 'calc(100% - 200px)',
        }}
      >
        {/* <Stack direction="row">
            {keys(state.players).map((id) => (
              <PlayerHand key={id} player={id} />
            ))}
          </Stack> */}
      </div>
      {/* <GameDialogs /> */}
    </div>
    //</FloatingCardsProvider>
  );
};
