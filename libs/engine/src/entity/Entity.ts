import { Flavor } from '../types';

export abstract class Entity<T extends string> {
  constructor(public id: Flavor<number | string, T>, public entity: T) {}
}
