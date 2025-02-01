import { attachment } from "@card-engine-lisp/engine";
import { cards } from "../../repo";

export const forestSnare = cards.add(attachment(
  {
    name: 'Forest Snare',
    unique: false,
    cost: 3,
    traits: ['item', 'trap'],
    sphere: 'lore',
  },
  {
    description: 'Attach to an enemy engaged with a player.',
    attachesTo: { type: 'enemy', zoneType: 'engaged' },
  },
  {
    description: 'Attached enemy cannot attack.',
    target: {
      hasAttachment: 'self',
    },
    card: {
      rules: {
        cantAttack: true,
      },
    },
  }
));
