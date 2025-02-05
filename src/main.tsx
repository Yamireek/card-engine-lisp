import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { App } from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// const game = new Game(cards, {
//   type: 'scenario',
//   data: {
//     scenario: {
//       name: 'empty',
//       quest: [],
//       sets: [],
//     },
//     players: [
//       {
//         name: 'test',
//         heroes: [core.hero.gimli, core.hero.legolas],
//         library: [],
//       },
//     ],
//     difficulty: 'normal',
//     extra: {
//       cards: 0,
//       resources: 0,
//     },
//   },
// });

// const gimli = game.getCard('Gimli');

// const int = new Interpreter2(game);
// int.run(['CARD', gimli.id, ['CALL', 'dealDamage', 1]]);
// int.run([
//   'CHOOSE',
//   'CARD',
//   'ALL',
//   { label: 'Choose card to heal', player: '0' },
//   ['CALL', 'heal', 1],
// ]);

// console.log(int.stack[0]);
