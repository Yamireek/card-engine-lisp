import { event } from "@card-engine-lisp/engine";
import { cards } from "../../repo";

export const commonCause = cards.add(event(
  {
    name: 'Common Cause',
    cost: 0,
    sphere: 'leadership',
  },
  {
    description:
      'Action: Exhaust 1 hero you control to choose and ready a different hero.',
    action: {
      player: 'controller',
      action: {
        chooseCardActions: {
          title: 'Choose hero to exhaust',
          target: { type: 'hero', controller: 'controller' },
          action: [
            {
              action: {
                useScope: {
                  var: 'exhaused',
                  card: 'target',
                },
                action: {
                  player: 'controller',
                  action: {
                    chooseCardActions: {
                      title: 'Choose hero to ready',
                      target: { type: 'hero', not: { var: 'exhausted' } },
                      action: 'ready',
                    },
                  },
                },
              },
            },
            'exhaust',
          ],
        },
      },
    },
  }
));
