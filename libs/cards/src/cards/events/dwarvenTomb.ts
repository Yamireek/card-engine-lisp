import { event } from "@card-engine-lisp/engine";
import { cards } from "../../repo";

export const dwarvenTomb = cards.add(event(
  {
    name: 'Dwarven Tomb',
    cost: 1,
    sphere: 'spirit',
  },
  {
    description:
      'Action: Return 1 [spirit] card from your discard pile to your hand.',
    action: {
      player: 'controller',
      action: {
        chooseCardActions: {
          title: 'Choose card',
          target: {
            zoneType: 'discardPile',
            owner: 'controller',
            sphere: 'spirit',
          },
          action: {
            move: {
              to: {
                player: 'controller',
                type: 'hand',
              },
            },
          },
        },
      },
    },
  }
));
