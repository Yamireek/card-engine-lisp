import { event } from "@card-engine-lisp/engine";
import { cards } from "../../repo";

export const swiftStrike = cards.add(event(
  {
    name: 'Swift Strike',
    cost: 2,
    sphere: 'tactics',
  },
  {
    description:
      'Response: After a character is declared as a defender, deal 2 damage to the attacking enemy.',
    target: 'character',
    response: {
      event: 'declaredAsDefender',
      action: {
        card: {
          event: 'attacking',
        },
        action: {
          dealDamage: 2,
        },
      },
    },
  }
));
