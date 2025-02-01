import { quest } from '@card-engine-lisp/engine';
import { cards } from '../../repo';

export const aForkInTheRoad = cards.add(
  quest({
    sequence: 2,
    name: 'A Fork in the Road',
    a: {},
    b: {
      questPoints: 2,
      // abilities: [
      //   {
      //     description:
      //       'Forced: When you defeat this stage, proceed to one of the 2 "A Chosen Path" stages, at random.',
      //     rule: {},
      //   },
      // ],
    },
  })
);
