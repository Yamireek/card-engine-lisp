import { attachment } from "@card-engine-lisp/engine";
import { cards } from "../../repo";

export const citadelPlate = cards.add(attachment(
  {
    name: 'Citadel Plate',
    unique: false,
    cost: 4,
    traits: ['item', 'armor'],
    sphere: 'tactics',
  },
  {
    description: 'Attach to a hero.',
    attachesTo: { type: 'hero' },
  },
  {
    description: 'Attached hero gets +4 Hit Points.',
    target: {
      hasAttachment: 'self',
    },
    increment: {
      hitPoints: 4,
    },
  }
));
