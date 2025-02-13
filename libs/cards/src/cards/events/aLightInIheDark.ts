import { event } from "@card-engine-lisp/engine";
import { cards } from "../../repo";

export const aLightInIheDark = cards.add(event(
  {
    name: 'A Light in the Dark',
    cost: 2,
    sphere: 'spirit',
  },
  {
    description:
      'Action: Choose an enemy engaged with a player. Return that enemy to the staging area.',
    action: {
      player: 'controller',
      action: {
        chooseCardActions: {
          title: 'Choose enemy',
          target: { type: 'enemy', zoneType: 'engaged' },
          action: {
            move: {
              to: 'stagingArea',
            },
          },
        },
      },
    },
  }
));
