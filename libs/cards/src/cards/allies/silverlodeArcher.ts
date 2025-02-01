import { ally } from "@card-engine-lisp/engine";
import { cards } from "../../repo";

export const silverlodeArcher = cards.add(ally({
  name: 'Silverlode Archer',
  cost: 3,
  willpower: 1,
  attack: 2,
  defense: 0,
  hitPoints: 1,
  traits: ['archer', 'silvan'],
  sphere: 'leadership',
  unique: false,
  keywords: {
    ranged: true,
  },
}));
