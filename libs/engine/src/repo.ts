import { CardDefinition, CardRef } from './state';

export class CardsRepo {
  private nextId = 1;
  private defs: Record<CardRef, CardDefinition> = {};

  constructor(private set: string) {}

  add(def: Omit<CardDefinition, 'ref'> & { ref?: CardRef }): CardRef {
    const ref = `${this.set}/${this.nextId++}` as CardRef;
    def.ref = ref;
    this.defs[ref] = def as CardDefinition;
    return ref;
  }

  get(ref: CardRef): CardDefinition {
    return this.defs[ref];
  }
}
