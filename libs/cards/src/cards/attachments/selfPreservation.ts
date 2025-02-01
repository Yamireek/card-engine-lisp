import { attachment } from "@card-engine-lisp/engine";
import { cards } from "../../repo";

export const selfPreservation = cards.add(attachment(
  {
    name: 'Self Preservation',
    unique: false,
    cost: 3,
    traits: ['skill'],
    sphere: 'lore',
  },
  {
    description: 'Attach to a character.',
    attachesTo: 'character',
  },
  {
    description:
      'Action: Exhaust Self Preservation to heal 2 points of damage from attached character.',
    action: {
      payment: {
        cost: {
          card: 'self',
          action: 'exhaust',
        },
        effect: {
          card: { hasAttachment: 'self' },
          action: { heal: 2 },
        },
      },
    },
  }
));
