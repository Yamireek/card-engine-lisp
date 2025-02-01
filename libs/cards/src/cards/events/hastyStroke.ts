import { event } from "@card-engine-lisp/engine";
import { cards } from "../../repo";

export const hastyStroke = cards.add(event(
  {
    name: 'Hasty Stroke',
    cost: 1,
    sphere: 'spirit',
  },
  {
    description:
      'Response: Cancel a shadow effect just triggered during combat.',
    response: {
      event: 'shadow',
      action: {
        cancel: 'shadow',
      },
    },
  }
));
