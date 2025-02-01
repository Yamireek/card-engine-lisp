import { ally } from '@card-engine-lisp/engine';
import { cards } from '../../repo';

export const daughterOfTheNimrodel = cards.add(
  ally(
    {
      name: 'Daughter of the Nimrodel',
      cost: 3,
      willpower: 1,
      attack: 0,
      defense: 0,
      hitPoints: 1,
      traits: ['silvan'],
      sphere: 'lore',
      unique: false,
    },
    {
      description:
        'Action: Exhaust Daughter of the Nimrodel to heal up to 2 damage on any 1 hero.',
      action: [
        { card: 'self', action: 'exhaust' },
        {
          player: 'controller',
          action: {
            chooseCardActions: {
              title: 'Choose hero to heal',
              target: { type: 'hero' },
              action: { heal: 2 },
            },
          },
        },
      ],
    }
  )
);
