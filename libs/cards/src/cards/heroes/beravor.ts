import { action, hero } from '@card-engine-lisp/engine';
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
    },
    action({
      description:
        'Exhaust Beravor to choose a player. That player draws 2 cards. Limit once per round.',
      limit: [1, 'round'],
      payment: ['CALL', 'exhaust'],
      effect: (self) => [
        'CHOOSE',
        {
          type: 'player',
          player: self.zone.owner?.id ?? 1,
          label: 'Choose player',
          filter: 'ALL',
          action: ['CALL', 'draw', 2],
          min: 1,
          max: 1,
        },
      ],
    })
  )
);
