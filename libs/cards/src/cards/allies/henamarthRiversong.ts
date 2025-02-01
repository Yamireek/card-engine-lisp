import { ally } from '@card-engine-lisp/engine';
import { cards } from '../../repo';

export const henamarthRiversong = cards.add(
  ally(
    {
      name: 'Henamarth Riversong',
      cost: 1,
      willpower: 1,
      attack: 1,
      defense: 0,
      hitPoints: 1,
      traits: ['silvan'],
      sphere: 'lore',
      unique: true,
    },
    {
      description:
        'Action: Exhaust Henamarth Riversong to look at the top card of the encounter deck.',
      action: [
        {
          card: 'self',
          action: 'exhaust',
        },
        { card: { top: 'encounterDeck' }, action: { flip: 'front' } },
      ],
    }
  )
);
