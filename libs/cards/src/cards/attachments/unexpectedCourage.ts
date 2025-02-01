import { attachment } from "@card-engine-lisp/engine";
import { cards } from "../../repo";

export const unexpectedCourage = cards.add(attachment(
  {
    name: 'Unexpected Courage',
    unique: false,
    cost: 2,
    traits: ['condition'],
    sphere: 'spirit',
  },
  {
    description: 'Attach to a hero.',
    attachesTo: { type: 'hero' },
  },
  {
    description: 'Action: Exhaust Unexpected Courage to ready attached hero.',
    action: {
      payment: {
        cost: {
          card: 'self',
          action: 'exhaust',
        },
        effect: {
          card: { hasAttachment: 'self' },
          action: 'ready',
        },
      },
    },
  }
));
