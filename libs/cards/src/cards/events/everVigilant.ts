import { event } from "@card-engine-lisp/engine";
import { cards } from "../../repo";

export const everVigilant = cards.add(event(
  {
    name: 'Ever Vigilant',
    cost: 1,
    sphere: 'leadership',
  },
  {
    description: 'Action: Choose and ready 1 ally card.',
    action: {
      player: 'controller',
      action: {
        chooseCardActions: {
          title: 'Choose ally to ready',
          target: { type: 'ally' },
          action: 'ready',
        },
      },
    },
  }
));
