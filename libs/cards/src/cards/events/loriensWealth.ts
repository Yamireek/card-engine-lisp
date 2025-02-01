import { event } from '@card-engine-lisp/engine';
import { cards } from '../../repo';

export const loriensWealth = cards.add(
  event(
    {
      name: "Lórien's Wealth",
      cost: 3,
      sphere: 'lore',
    },
    {
      description: 'Action: Choose a player. That player draws 3 cards.',
      action: {
        player: 'controller',
        action: {
          choosePlayerActions: {
            title: 'Choose player',
            target: 'each',
            action: {
              draw: 3,
            },
          },
        },
      },
    }
  )
);
