import { PlayerDeck } from '@card-engine-lisp/engine';
import * as hero from '../cards/heroes';

export const testDeck: PlayerDeck = {
  name: 'Test',
  heroes: [hero.gimli],
  library: [],
};
