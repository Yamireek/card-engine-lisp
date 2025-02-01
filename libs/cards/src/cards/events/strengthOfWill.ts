import { event } from "@card-engine-lisp/engine";
import { cards } from "../../repo";

export const strengthOfWill = cards.add(event(
  {
    name: 'Strength of Will',
    cost: 0,
    sphere: 'spirit',
  },
  {
    description:
      'Response: After you travel to a location, exhaust a [spirit] character to place 2 progress tokens on that location.',
    target: { type: 'location' },
    response: {
      event: 'traveled',
      action: [
        {
          player: 'controller',
          action: {
            chooseCardActions: {
              title: 'Choose character',
              target: {
                simple: 'character',
                sphere: 'spirit',
              },
              action: 'exhaust',
            },
          },
        },
        {
          card: 'target',
          action: {
            placeProgress: 2,
          },
        },
      ],
    },
  }
));
