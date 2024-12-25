// src/server.js
import { LotrLCGame } from '@card-engine-lisp/engine';
import { Server, Origins } from 'boardgame.io/server';

const server = Server({
  games: [LotrLCGame()],
  origins: [
    'https://card-engine-client.onrender.com',
    'http://192.168.0.101:4200',
    Origins.LOCALHOST,
  ],
});

server.run({
  port: 3000,
});
