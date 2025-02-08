/* eslint-disable @typescript-eslint/no-explicit-any */
import { Action, State, EntityAction } from '../state';
import { stringify } from '../utils';
import { Game, Types } from './Game';
import patch from 'fast-json-patch';

export class Interpreter {
  public stack: Action[] = [];

  toJSON(): State {
    return {
      game: this.game.toJSON(),
      stack: this.stack.map((s) => stringify(s)),
    };
  }

  constructor(public game: Game) {}

  step() {
    const next = this.stack.shift();
    if (next) {
      return this.exe(next);
    } else {
      return true;
    }
  }

  run(...actions: Action[]) {
    this.stack.unshift(...actions);
    while (true) {
      const stop = this.step();
      if (stop) {
        break;
      }
    }
  }

  exe(action: Action): boolean {
    const type = action[0];
    switch (type) {
      case 'CARD':
      case 'PLAYER':
      case 'ZONE': {
        const [, filter, operation] = action;
        const targets = this.game.filter(type, filter as any);
        if (targets.length === 0) {
          return false;
        } else if (targets.length === 1) {
          return this.exeOn(type, targets[0], operation as any);
        } else {
          const ins = targets.map((t) => [type, t.id, operation]);
          this.stack.unshift(...(ins as any));
          return false;
        }
      }
      case 'CHOOSE': {
        this.stack.unshift(action);
        return true;
      }
      case 'GAME': {
        return this.exeOn('GAME', this.game, action[1]);
      }
      case 'CALL': {
        return this.exeOn('GAME', this.game, action);
      }
      case 'SEQ': {
        const [, ...inner] = action;
        this.stack.unshift(...inner);
        return false;
      }
      default: {
        throw new Error('unknown action: ' + JSON.stringify(action));
      }
    }
  }

  exeOn<E extends keyof Types>(
    type: E,
    entity: Types[E]['entity'],
    action: EntityAction<Types[E]['entity']>
  ): boolean {
    const ins = action[0];
    switch (ins) {
      case 'CALL': {
        const [, name, ...args] = action;
        const method = (entity as any)[name as any](...args);
        if (typeof method.body === 'function') {
          const prev = entity.toJSON();
          method.body();
          const next = entity.toJSON();
          if (type === 'GAME' || entity instanceof Game) {
            console.log('action', type, action, patch.compare(prev, next));
          } else {
            console.log(
              'action',
              type,
              entity.id,
              action,
              patch.compare(prev, next)
            );
          }
          return false;
        } else {
          if (!method.isAllowed || method.isAllowed()) {
            return this.exeOn(type, entity, method.body);
          } else {
            return false;
          }
        }
      }
      case 'SEQ': {
        const [, ...actions] = action;
        if (type === 'GAME' || entity instanceof Game) {
          this.stack.unshift(...actions.map((a) => [...a] as any));
        } else {
          this.stack.unshift(
            ...actions.map((a) => [type, entity.id, a] as any)
          );
        }

        return false;
      }
      case 'GAME': {
        const [, a] = action;
        return this.exe(a as any);
      }
      default: {
        throw new Error('uknown action: ' + JSON.stringify(action));
      }
    }
  }
}
