import { hero } from '@card-engine-lisp/engine';
import { cards } from '../../repo';

export const gimli = cards.add(
  hero(
    {
      name: 'Gimli',
      threatCost: 11,
      willpower: 2,
      attack: 2,
      defense: 2,
      hitPoints: 5,
      traits: ['dwarf', 'noble', 'warrior'],
      sphere: 'tactics',
    },
    {
      description: 'Gimli gets +1 [attack] for each damage token on him.',
      code: (self) => {
        return {
          type: 'card',
          target: self.id,
          modifier: (card) => (p) => {
            if (p.attack !== undefined) {
              p.attack += card.token.damage;
            }
          },
        };
      },
    }
  )
);
