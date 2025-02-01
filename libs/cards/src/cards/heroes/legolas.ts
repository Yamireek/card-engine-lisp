import { hero } from '@card-engine-lisp/engine';
import { cards } from '../../repo';

export const legolas = cards.add(
  hero(
    {
      name: 'Legolas',
      threatCost: 9,
      willpower: 1,
      attack: 3,
      defense: 1,
      hitPoints: 4,
      traits: ['noble', 'silvan', 'warrior'],
      sphere: 'tactics',
      keywords: {
        ranged: true,
      },
    }
    // {
    //   description:
    //     'After Legolas participates in an attack that destroys an enemy, place 2 progress tokens on the current quest.',
    //   target: { type: 'enemy' },
    //   response: {
    //     event: 'destroyed',
    //     condition: {
    //       event: {
    //         type: 'destroyed',
    //         isAttacker: 'self',
    //       },
    //     },
    //     action: {
    //       placeProgress: 2,
    //     },
    //   },
    // }
  )
);
