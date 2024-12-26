import { useContext } from 'react';
import { StateContext } from '../game/StateContext';
import { cardSize } from './Card3d';
import { LotrCardArea } from './LotrCardArea';
import { LotrDeck3d } from './LotrDeck3d';
import { Vector3 } from './types';

const positions: Record<number, Vector3> = {
  '1': [-0.155, 0.39, 0],
  '2': [-0.155, 0.39, 0],
  '3': [0, 0, 0],
  '4': [0, 0, 0],
};

export const GameAreas = (props: { playerCount: number }) => {
  const { game } = useContext(StateContext);

  const playerCount = props.playerCount;

  return (
    <group position={positions[playerCount]}>
      <LotrDeck3d zone={game.zones.encounterDeck} position={[0.31, -0.2, 0]} />
      <LotrDeck3d zone={game.zones.discardPile} position={[0.39, -0.2, 0]} />

      <LotrCardArea
        orientation="landscape"
        cards={game.zones.questArea.cards.map((id) => game.card[id])}
        layout={{
          position: [0.144, -0.2],
          size: { width: 0.1, height: 0.1 },
        }}
      />

      <LotrCardArea
        cards={game.zones.activeLocation.cards.map((id) => game.card[id])}
        layout={{
          position: [0.23, -0.2],
          size: { width: cardSize.width + 0.01, height: 0.1 },
        }}
      />

      <LotrCardArea
        cards={game.zones.stagingArea.cards.map((id) => game.card[id])}
        layout={{
          position: [-0.1, -0.2],
          size: { width: 0.4, height: 0.1 },
          color: 'red',
        }}
      />
    </group>
  );
};
