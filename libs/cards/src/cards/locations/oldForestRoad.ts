import { location } from '@card-engine-lisp/engine';
import { cards } from '../../repo';

export const oldForestRoad = cards.add(
  location(
    {
      name: 'Old Forest Road',
      threat: 1,
      questPoints: 3,
      traits: ['forest'],
    },
    {
      description:
        'Response: After you travel to Old Forest Road the first player may choose and ready 1 character he controls.',
      target: 'self',
      response: {
        event: 'traveled',
        action: {
          player: 'first',
          action: {
            chooseCardActions: {
              title: 'Ready 1 character',
              target: 'character',
              action: 'ready',
            },
          },
        },
      },
    }
  )
);
