import { ally } from "@card-engine-lisp/engine";
import { cards } from "../../repo";

export const gondorianSpearman = cards.add(ally(
  {
    name: 'Gondorian Spearman',
    unique: false,
    cost: 2,
    willpower: 0,
    attack: 1,
    defense: 1,
    hitPoints: 1,
    traits: ['gondor', 'warrior'],
    sphere: 'tactics',
    keywords: {
      sentinel: true,
    },
  },
  {
    description:
      'Response: After Gondorian Spearman is declared as a defender, deal 1 damage to the attacking enemy.',
    target: 'self',
    response: {
      event: 'declaredAsDefender',
      action: {
        card: {
          event: 'attacking',
        },
        action: {
          dealDamage: 1,
        },
      },
    },
  }
));
