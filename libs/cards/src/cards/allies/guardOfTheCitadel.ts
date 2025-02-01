import { ally } from "@card-engine-lisp/engine";
import { cards } from "../../repo";

export const guardOfTheCitadel = cards.add(ally({
  name: 'Guard of the Citadel',
  cost: 2,
  willpower: 1,
  attack: 1,
  defense: 0,
  hitPoints: 2,
  traits: ['gondor', 'warrior'],
  sphere: 'leadership',
  unique: false,
}));
