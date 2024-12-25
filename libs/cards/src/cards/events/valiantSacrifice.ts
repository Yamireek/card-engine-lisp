import { event } from "@card-engine-lisp/engine";

export const valiantSacrifice = event(
  {
    name: 'Valiant Sacrifice',
    cost: 1,
    sphere: 'leadership',
  },
  {
    description:
      "Response: After an ally card leaves play, that card's controller draws 2 cards.",
    target: { type: 'ally' },
    response: {
      event: 'leftPlay',
      action: {
        player: { controllerOf: 'target' },
        action: {
          draw: 2,
        },
      },
    },
  }
);
