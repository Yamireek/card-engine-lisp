import { ally } from "@card-engine-lisp/engine";
import { cards } from "../../repo";

export const faramir = cards.add(ally(
  {
    name: 'Faramir',
    cost: 4,
    willpower: 2,
    attack: 1,
    defense: 2,
    hitPoints: 3,
    traits: ['gondor', 'noble', 'ranger'],
    sphere: 'leadership',
    unique: true,
  },
  {
    description:
      'Action: Exhaust Faramir to choose a player. Each character controlled by that player gets +1 [willpower] until the end of the phase.',
    action: [
      {
        card: 'self',
        action: 'exhaust',
      },
      {
        player: 'controller',
        action: {
          choosePlayerActions: {
            target: 'each',
            action: {
              controlled: {
                modify: {
                  increment: { willpower: 1 },
                },
                until: 'end_of_phase',
              },
            },
            title: 'Choose player',
          },
        },
      },
    ],
  }
));
