import { CardDefinition, PrintedProps, Side } from '@card-engine-lisp/engine';
import * as image from './../images';

export type CardImageUrls = { front: string; back: string };

export function getCardImageUrl(
  props: PrintedProps,
  side: Side,
  frontName?: string
): string {
  if (props.type === 'player_back') {
    return image.playerBack;
  }

  if (props.type === 'encounter_back') {
    return image.encounterBack;
  }

  if (props.type === 'quest') {
    const name = props.name ?? '';
    return `./images/cards/01-core/${props.sequence}${
      side === 'front' ? 'A' : 'B'
    } - ${name}.jpg`;
  }

  const name = side === 'shadow' ? frontName : props.name || props.type;
  return `./images/cards/01-core/${name}.jpg`;
}

export function getCardImageUrls(card: CardDefinition): CardImageUrls {
  return {
    front: getCardImageUrl(card.front, 'front'),
    back: getCardImageUrl(card.back, 'back'),
  };
}

export function capitalizeFirst(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
