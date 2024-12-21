export type NewGameParams = {
  type: 'new';
  server?: 'local' | { url: string };
  playerCount: '1' | '2' | '3' | '4';
};

export type LoadGameParams = {
  type: 'load';
  state: string;
};

export type JoinGameParams = {
  type: 'join';
  server: string;
  playerID: string;
  matchID: string;
  credentials: string;
};

export type SetupParams = NewGameParams | LoadGameParams | JoinGameParams;
