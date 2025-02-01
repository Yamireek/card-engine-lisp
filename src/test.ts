/* eslint-disable no-eval */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CardsRepo, Game, hero } from '@card-engine-lisp/engine';

const cards = new CardsRepo('test');

const testHero = cards.add(
  hero(
    {
      name: 'hero',
      attack: 1,
      defense: 1,
      willpower: 1,
      hitPoints: 6,
      sphere: 'lore',
      threatCost: 5,
      traits: [],
    },
    {
      description: '+1 attack for each damage token',
      code: (self) => {
        return {
          type: 'card',
          target: self,
          modifier: (card) => (p) => {
            if (p.attack !== undefined) {
              p.attack += card.token.damage;
            }
          },
        };
      },
    }
  )
);

const game = new Game(cards, {
  type: 'scenario',
  data: {
    scenario: {
      name: 'test',
      sets: [],
      quest: [],
    },
    players: [
      {
        name: 'test',
        heroes: [testHero],
        library: [],
      },
    ],
    difficulty: 'easy',
    extra: { resources: 0, cards: 0 },
  },
});

game.cards[0].dealDamage(5);

game.effects.push({
  type: 'card',
  target: () => true,
  modifier: (card) => (props) => (props.defense = 0),
});

game.recalculate();
game.recalculate();

console.log(game.cards[0]);

console.log(game.toJSON());

console.log(
  new Game(cards, {
    type: 'json',
    data: game.toJSON(),
  })
);
