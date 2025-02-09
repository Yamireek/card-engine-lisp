/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Action,
  Card,
  CardRef,
  EntityAction,
  Game,
  GameZoneType,
  Interpreter,
  PlayerId,
  PlayerZoneType,
  Side,
  State,
  ZoneState,
  GameState,
  CardState,
  stringify,
  Triggers,
} from '@card-engine-lisp/engine';
import { cards } from './repo';

export type SimpleState = {
  players: Array<Partial<Record<PlayerZoneType, SimpleCardState[]>>>;
} & Partial<Record<GameZoneType, SimpleCardState[]>>;

export type SimpleCardState =
  | CardRef
  | {
      ref: CardRef;
      resources?: number;
      progress?: number;
      damage?: number;
      exhausted?: boolean;
      attachments?: CardRef[];
      side?: Side;
    };

export function createState(initState: SimpleState): State {
  const state: GameState = {
    players: [],
    zones: [],
    cards: [],
    effects: [],
    limits: {},
    nextId: 1,
    triggers: stringify<Triggers>({ end_of_round: [] }),
  };

  for (let index = 0; index < initState.players.length; index++) {
    state.players.push({ id: index + 1, threat: 30 }); // TODO init threat

    const playerZones: PlayerZoneType[] = [
      'library',
      'hand',
      'playerArea',
      'engaged',
      'discardPile',
    ];

    for (const zoneName of playerZones) {
      const zone: ZoneState = {
        id: state.nextId++,
        type: zoneName,
        cards: [],
        owner: index + 1,
      };

      state.zones.push(zone);

      if (initState.players[index][zoneName]) {
        for (const card of initState.players[index][zoneName]!) {
          const ref: CardRef = typeof card === 'string' ? card : card.ref;
          const cardState: CardState = {
            id: state.nextId++,
            ref,
            token: { damage: 0, progress: 0, resource: 0 },
            up: zoneName === 'library' ? 'back' : 'front',
            zoneId: zone.id,
          };
          state.cards.push(cardState);

          if (typeof card === 'object') {
            if (card.damage) {
              cardState.token.damage += card.damage;
            }
            if (card.progress) {
              cardState.token.progress += card.progress;
            }
            if (card.resources) {
              cardState.token.resource += card.resources;
            }
          }
        }
      }
    }
  }

  return {
    game: state,
    stack: [],
  };
}

export class TestGame {
  public int: Interpreter;
  public game: Game;

  constructor(simpleState: SimpleState) {
    const state = createState(simpleState);
    this.game = new Game(cards, { type: 'json', data: state.game });
    this.int = new Interpreter(this.game);
    this.int.run();
  }

  getCard(name: string) {
    const cards = this.game.filter('CARD', (c) => c.props.name === name);
    return new CardProxy(cards[0], this);
  }

  getPlayer(id: PlayerId) {
    const player = this.game.player[id];
    if (!player) {
      throw new Error('player now found');
    } else {
      return player;
    }
  }

  exe(action: Action) {
    this.int.run(action);
    this.game.recalculate();
  }

  get actions() {
    return this.game.cards.flatMap((card) =>
      card.props.actions
        .filter((a) => this.game.canEntityExe('CARD', card, a.action(card)))
        .map((a) => ({
          card,
          desc: a.desc,
          action: a.action(card),
        }))
    );
  }

  do(desc: string) {
    const actions = this.actions.filter((a) => a.desc === desc);
    if (actions.length === 1) {
      const action = actions[0];
      this.run(['CARD', action.card.id as any, action.action]);
    } else {
      throw new Error('not found 1 action');
    }
  }

  run(action: Action) {
    this.int.stack.unshift(action);
    while (true) {
      this.int.run();
      const next = this.int.stack[0];
      if (!next) {
        return;
      }

      if (next[0] === 'CHOOSE') {
        const options = next[1];
        if (options.type === 'player') {
          const targets = this.game.filter('PLAYER', options.filter);
          if (targets.length === 1 && options.min == 1 && options.max === 1) {
            this.int.stack.shift();
            this.int.stack.unshift([
              'PLAYER',
              targets.map((t) => t.id),
              options.action,
            ]);
          }
        } else {
          return;
        }
      }
    }
  }
}

export class CardProxy {
  constructor(private card: Card, private test: TestGame) {}

  get props() {
    return this.card.props;
  }

  exe(action: EntityAction<Card>) {
    this.test.run(['CARD', this.card.id as any, action]);
  }
}
