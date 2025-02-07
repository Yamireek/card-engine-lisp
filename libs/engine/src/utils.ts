import { isArray } from 'lodash';
import _ from 'lodash';

export function asArray<T>(items: T | T[]): T[] {
  if (isArray(items)) {
    return items;
  }

  return [items];
}

export function simpleMap<A, B>(items: A[], mapper: (item: A) => B): B | B[] {
  if (items.length === 1) {
    return mapper(items[0]);
  } else {
    return items.map(mapper);
  }
}

export function values<TK extends string | number, TI>(
  records?: Partial<Record<TK, TI>>
) {
  if (!records) {
    return [];
  }
  return Object.values(records) as TI[];
}

export function mapValues<TK extends string | number, TI, TO>(
  records: Partial<Record<TK, TI>>,
  mapper: (item: TI) => TO
) {
  return _.mapValues(records, mapper) as Record<TK, TO>;
}

export function keys<TK extends string | number, TI>(
  records?: Partial<Record<TK, TI>>
): TK[] {
  if (!records) {
    return [];
  }
  return Object.keys(records).filter(
    (k) => records[k as TK] !== undefined
  ) as TK[];
}

export function repeat(amount: number, action: () => void) {
  for (let i = 0; i < amount; i++) {
    action();
  }
}

export function remove<T>(array: T[], item: T) {
  const index = array.indexOf(item);
  array.splice(index);
}

export function stringify(obj: object) {
  const placeholder = '____PLACEHOLDER____';
  const fns: Array<any> = [];
  let json = JSON.stringify(
    obj,
    function (_, value) {
      if (typeof value === 'function') {
        fns.push(value);
        return placeholder;
      }
      return value;
    },
    2
  );
  json = json.replace(new RegExp('"' + placeholder + '"', 'g'), function () {
    return fns.shift();
  });

  return `(${json})`;
}

export function shuffle<T>(items: T[]) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = items[i];
    items[i] = items[j];
    items[j] = temp;
  }
}
