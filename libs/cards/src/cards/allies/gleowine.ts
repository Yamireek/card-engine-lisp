import { ally } from '@card-engine-lisp/engine';
import { cards } from '../../repo';

export const gleowine = cards.add(
  ally(
    {
      name: 'Gléowine',
      cost: 2,
      willpower: 1,
      attack: 0,
      defense: 0,
      hitPoints: 2,
      traits: ['minstrel', 'rohan'],
      sphere: 'lore',
      unique: true,
    },
    {
      description:
        'Action: Exhaust Gléowine to choose a player. That player draws 1 card.',
      action: [
        { card: 'self', action: 'exhaust' },
        {
          player: 'controller',
          action: {
            choosePlayerActions: {
              title: 'Choose player to draw 1 card',
              target: 'each',
              action: { draw: 1 },
            },
          },
        },
      ],
    }
  )
);
