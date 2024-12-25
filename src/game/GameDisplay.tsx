import { useContext, useEffect } from 'react';
import { StateContext, useGameState } from './StateContext';
import { LotrLCGInfo } from './LotrLCGInfo';
import { GameSceneLoader } from './GameScene';
import { Board3d } from './Board3d';
import { PlayerAreas } from './PlayerAreas';
import { GameAreas } from './GameAreas';

export const GameDisplay = () => {
  const { state } = useContext(StateContext);
  const ctx = useGameState();

  //   const textureUrls = useMemo(
  //     () => [...staticUrls, ...getAllImageUrls(state)],
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //     []
  //   );

  useEffect(() => {
    const handleUnload = () => {
      ctx.leave();
    };
    window.addEventListener('unload', handleUnload);
    return () => {
      window.removeEventListener('unload', handleUnload);
    };
  }, [ctx]);

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
            {ctx.game.players.map((p) => (
              <PlayerAreas key={p.id} player={p} />
            ))}

            <GameAreas playerCount={ctx.game.players.length} />
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
