import { event } from '@card-engine-lisp/engine';
import { cards } from "../../repo";

export const thicketOfSpears = cards.add(
  event(
    {
      name: 'Thicket of Spears',
      cost: 3,
      sphere: 'tactics',
    },
    {
      description:
        "You must use resources from 3 different heroes' pools to pay for this card. Action: Choose a player. That player's engaged enemies cannot attack that player this phase.",
      payment: {
        needHeroes: 3,
      },
      phase: 'combat',
      action: {
        player: 'controller',
        action: {
          choosePlayerActions: {
            title: 'Choose player',
            target: 'each',
            action: {
              engaged: {
                modify: {
                  rules: {
                    cantAttack: true,
                  },
                },
                until: 'end_of_phase',
              },
            },
          },
        },
      },
    }
  )
);
