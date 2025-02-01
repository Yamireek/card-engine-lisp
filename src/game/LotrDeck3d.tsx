import { Deck3d } from './Deck3d';
import { Game, Zone } from '@card-engine-lisp/engine';
import { Vector3 } from './types';
import { last } from 'ramda';
import { getCardImageUrl } from './utils';
import { useGameState } from './StateContext';
import { useTextures } from './../images/textures';

function getDeckImage(game: Game, zone: Zone): string {
  const card = last(zone.cards);
  if (!card) {
    return '';
  }

  const side = card.up === 'shadow' ? 'front' : card.up;

  return getCardImageUrl(card.def[side], side);
}

export type LotrDeck3dProps = { zone: Zone; position: Vector3 };

export const LotrDeck3d = (props: LotrDeck3dProps) => {
  const { game } = useGameState();
  const { texture } = useTextures();

  return (
    <Deck3d
      name={`deck-${props.zone.id}`}
      title={props.zone.type}
      position={props.position}
      cardCount={props.zone.cards.length}
      texture={texture[getDeckImage(game, props.zone)]}
    />
  );
};
