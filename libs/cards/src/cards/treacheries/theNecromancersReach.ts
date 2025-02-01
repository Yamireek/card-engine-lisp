import { treachery } from '@card-engine-lisp/engine';
import { cards } from '../../repo';

export const theNecromancersReach = cards.add(
  treachery(
    {
      name: "The Necromancer's Reach",
    },
    {
      description: 'When Revealed: Deal 1 damage to each exhausted character.',
      whenRevealed: {
        card: { simple: ['character', 'exhausted'] },
        action: {
          dealDamage: 1,
        },
      },
    }
  )
);
