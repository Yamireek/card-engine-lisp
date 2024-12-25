import { Deck3d } from './Deck3d';
import { Zone } from '@card-engine-lisp/engine';
import { Vector3 } from './types';

export type LotrDeck3dProps = { zone: Zone; position: Vector3 };

export const LotrDeck3d = (props: LotrDeck3dProps) => {
  // const { state } = useGameState();
  //const { texture } = useTextures();

  //const zone = getZoneState(props.zone, state);

  return (
    <Deck3d
      name={`deck-${props.zone.id}`}
      title={props.zone.id.toString()}
      position={props.position}
      cardCount={props.zone.cards.length}
      //texture={texture[getDeckImage(props.zone, zone, state)]}
    />
  );
};
