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
    },
    {
      description:
        'Exhaust Beravor to choose a player. That player draws 2 cards. Limit once per round.',
      code: (self) => ({
        type: 'card' as const,
        target: self.id,
        modifier: () => (p) => {
          p.actions.push({
            desc: 'Exhaust Beravor to choose a player. That player draws 2 cards. Limit once per round.',
            // TODO limit
            action: () => [
              'SEQ',
              ['CALL', 'exhaust'],
              [
                'CHOOSE',
                {
                  type: 'player',
                  player: self.zone.owner?.id ?? '0',
                  label: 'Choose player',
                  filter: 'ALL',
                  action: ['CALL', 'draw', 2],
                  min: 1,
                  max: 1,
                },
              ],
            ],
          });
        },
      }),
    }
  )
);
