import { event } from "@card-engine-lisp/engine";
import { cards } from "../../repo";

export const loreOfImladris = cards.add(event(
  {
    name: 'Lore of Imladris',
    cost: 2,
    sphere: 'lore',
  },
  {
    description:
      'Action: Choose a character. Heal all damage from that character.',
    action: {
      player: 'controller',
      action: {
        chooseCardActions: {
          title: 'Choose character to heal',
          target: 'character',
          action: {
            heal: 'all',
          },
        },
      },
    },
  }
));
