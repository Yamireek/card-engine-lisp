import { Deck3d } from './Deck3d';
import { Game, Zone } from '@card-engine-lisp/engine';
import { Vector3 } from './types';
import { last } from 'ramda';
import { getCardImageUrl } from './utils';
import * as image from './../images';
import { useGameState } from './StateContext';
import { useTextures } from './../images/textures';

function getDeckImage(game: Game, zone: Zone): string {
  const topCardId = last(zone.cards);
  if (!topCardId) {
    return zone.type === 'encounterDeck'
      ? image.encounterBack
      : image.playerBack;
  }

  const card = game.card[topCardId];

  const side = card.sideUp === 'shadow' ? 'front' : card.sideUp;

  return getCardImageUrl(card.definition[side], side);
}

export type LotrDeck3dProps = { zone: Zone; position: Vector3 };

export const LotrDeck3d = (props: LotrDeck3dProps) => {
  const { game } = useGameState();
  const { texture } = useTextures();

  return (
    <Deck3d
      name={`deck-${props.zone.id}`}
      title={props.zone.id.toString()}
      position={props.position}
      cardCount={props.zone.cards.length}
      texture={texture[getDeckImage(game, props.zone)]}
    />
  );
};
