import { hero } from "@card-engine-lisp/engine";

export const gimli = hero(
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
    increment: {
      attack: {
        card: {
          target: 'self',
          value: {
            tokens: 'damage',
          },
        },
      },
    },
  }
);
