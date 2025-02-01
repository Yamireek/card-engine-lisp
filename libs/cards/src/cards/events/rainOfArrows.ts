import { event } from '@card-engine-lisp/engine';
import { cards } from '../../repo';

export const rainOfArrows = cards.add(
  event(
    {
      name: 'Rain of Arrows',
      cost: 1,
      sphere: 'tactics',
    },
    {
      description:
        'Action: Exhaust a character you control with the ranged keyword to choose a player. Deal 1 damage to each enemy engaged with that player.',
      action: {
        payment: {
          cost: {
            player: 'controller',
            action: {
              chooseCardActions: {
                title: 'Choose character to exhaust',
                target: {
                  controller: 'controller',
                  keyword: 'ranged',
                },
                action: 'exhaust',
              },
            },
          },
          effect: {
            player: 'controller',
            action: {
              choosePlayerActions: {
                title: 'Choose player',
                target: 'each',
                action: {
                  engaged: { dealDamage: 1 },
                },
              },
            },
          },
        },
      },
    }
  )
);
