import { PlayerId } from '@card-engine-lisp/engine';

export function validPlayerId(id?: number | string | null): PlayerId {
  if (id === undefined || id === null) {
    throw new Error('invalid playerId');
  }

  if (typeof id === 'number') {
    if (id >= 0 && id <= 4) {
      return id.toString() as PlayerId;
    } else {
      throw new Error('invalid playerId');
    }
  }

  if (['0', '1', '2', '3'].includes(id)) {
    return id as PlayerId;
  } else {
    throw new Error('invalid playerId');
  }
}
