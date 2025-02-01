import { ally } from "@card-engine-lisp/engine";
import { cards } from "../../repo";

export const veteranAxehand = cards.add(ally({
  name: 'Veteran Axehand',
  cost: 2,
  willpower: 0,
  attack: 2,
  defense: 1,
  hitPoints: 2,
  traits: ['dwarf', 'warrior'],
  sphere: 'tactics',
  unique: false,
}));
