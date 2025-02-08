import { useContext } from 'react';
import { StateContext } from '../game/StateContext';
import { LotrCardArea } from './LotrCardArea';
import { LotrDeck3d } from './LotrDeck3d';
import { Player } from '@card-engine-lisp/engine';

const positions = {
  1: { 1: [-0.155, 0.39, 0] },
  2: { 1: [-0.155, 0.39, 0], 2: [0.575, 0.39, 0] },
  3: { 1: [0.5, -0.4, 0], 2: [-0.5, -0.4, 0], 3: [0, 0.4, 0] },
  4: {
    1: [0.5, -0.4, 0],
    2: [-0.5, -0.4, 0],
    3: [0.5, 0.4, 0],
    4: [-0.5, 0.4, 0],
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

const rotations = {
  1: { 1: 0 },
  2: { 1: 0, 2: 0 },
  3: { 1: 0, 2: 0, 3: Math.PI },
  4: { 1: 0, 2: 0, 3: Math.PI, 4: Math.PI },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

export const PlayerAreas = (props: { player: Player }) => {
  const { game } = useContext(StateContext);
  const playerCount = game.players.length;

  return (
    <group
      position={positions[playerCount][props.player.id]}
      rotation={[0, 0, rotations[playerCount][props.player.id] ?? 0]}
    >
      <LotrDeck3d
        zone={props.player.getZone('library')}
        position={[0.39, -0.4, 0]}
      />
      <LotrDeck3d
        zone={props.player.getZone('discardPile')}
        position={[0.39, -0.5, 0]}
      />
      <LotrCardArea
        cards={props.player.getZone('playerArea').cards}
        layout={{
          position: [0.025, -0.45],
          size: { width: 0.65, height: 0.2 },
          color: 'red',
        }}
      />
      <LotrCardArea
        cards={props.player.getZone('engaged').cards}
        layout={{
          position: [0.065, -0.3],
          size: { width: 0.73, height: 0.1 },
          color: 'red',
        }}
      />
    </group>
  );
};
