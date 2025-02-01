import { location } from '@card-engine-lisp/engine';
import { cards } from '../../repo';

export const enchantedStream = cards.add(
  location(
    {
      name: 'Enchanted Stream',
      threat: 2,
      questPoints: 2,
      traits: ['forest'],
    },
    {
      description:
        'While Enchanted Stream is the active location, players cannot draw cards.',
      condition: {
        card: {
          target: 'self',
          value: {
            zone: 'activeLocation',
          },
        },
      },
      target: 'each',
      player: {
        rules: {
          disableDraw: true,
        },
      },
    }
  )
);
