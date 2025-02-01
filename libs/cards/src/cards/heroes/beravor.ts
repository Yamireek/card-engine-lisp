import { hero } from '@card-engine-lisp/engine';
import { cards } from '../../repo';

export const beravor = cards.add(
  hero(
    {
      name: 'Beravor',
      threatCost: 10,
      willpower: 2,
      attack: 2,
      defense: 2,
      hitPoints: 4,
      traits: ['dúnedain', 'ranger'],
      sphere: 'lore',
    }
    // {
    //   description:
    //     'Exhaust Beravor to choose a player. That player draws 2 cards. Limit once per round.',
    //   limit: {
    //     max: 1,
    //     type: 'round',
    //   },
    //   action: {
    //     payment: {
    //       cost: {
    //         card: 'self',
    //         action: 'exhaust',
    //       },
    //       effect: {
    //         player: 'controller',
    //         action: {
    //           choosePlayerActions: {
    //             title: 'Choose player to draw 2 cards',
    //             target: 'each',
    //             action: {
    //               draw: 2,
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
    // }
  )
);
