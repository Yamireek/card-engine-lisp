/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, isArray, mapValues } from 'lodash';
import {
  ArrayValue,
  BinaryOperator,
  Env,
  FunctionValue,
  Instruction,
  InstructionsValue,
  Value,
} from './types';
import { fromValue, keys, toJSFunction, toValue } from './utils';
import { makeAutoObservable } from 'mobx';
import { clone, reverse } from 'ramda';
import { StaticAgent } from './agent/StaticAgent';
import { InterpretedAgent } from './agent/InterpretedAgent';
import { State } from './state/State';
import { Agent } from './agent';
import { Card, Game } from './entity';

const operations: Record<BinaryOperator, (...args: any[]) => Value> = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
  '===': (a, b) => a === b,
  '==': (a, b) => a == b,
  '<=': (a, b) => a <= b,
  '<': (a, b) => a < b,
};

export class Interpreter {
  public stack: Value[] = [];

  public vars: Env = {};

  static fromJson(state: State, agent: Agent) {
    const cloned = clone(state);

    const game = new Game(agent);
    game.nextId = cloned.game.nextId;
    for (const key of keys(cloned.game.card)) {
      const card = cloned.game.card[key];
      game.card[key] = Card.fromJson(game, card);
    }
    const interpreter = new Interpreter(cloned.instructions, game, false);
    interpreter.stack = cloned.stack;
    interpreter.vars = cloned.vars;
    return interpreter;
  }

  toJson(): State {
    return {
      game: {
        nextId: this.game.nextId,
        card: mapValues(this.game.card, (card) => card.toJson()),
      },
      stack: this.stack,
      vars: this.vars,
      instructions: this.instructions,
    };
  }

  constructor(
    public instructions: Instruction[],
    public game: Game = new Game(new StaticAgent([])),
    public observable = false
  ) {
    if (observable) {
      makeAutoObservable(this);
    }
  }

  private execute(ins: Instruction) {
    if (typeof ins === 'string') {
      switch (ins) {
        case '+':
        case '-':
        case '*':
        case '/':
        case '==':
        case '===':
        case '<=': {
          const b = this.stack.pop() as number;
          const a = this.stack.pop() as number;
          this.stack.push(operations[ins](a, b));
          return;
        }
        case '?':
        case 'IF': {
          const result = this.stack.pop() as boolean;
          const ifFalse = this.stack.pop() as InstructionsValue;
          const ifTrue = this.stack.pop() as InstructionsValue;
          this.instructions.unshift(...(result ? ifTrue.body : ifFalse.body));
          return;
        }
        case 'RETURN': {
          return;
        }
        case 'CALL': {
          const func = this.stack.pop() as FunctionValue;
          for (const arg of reverse(func.parameters)) {
            const value = this.stack.pop();
            if (value) {
              this.setValue(arg, value);
            }
          }
          this.instructions.unshift(...func.body);
          return;
        }
        default:
          return `unknown instruction: ${ins}`;
      }
    }

    switch (ins[0]) {
      case 'PUSH': {
        const value = ins[1] as Value;
        this.stack.push(value);
        return;
      }
      case 'CALL': {
        if (ins.length === 4) {
          const path = ins[1] as string;
          const property = ins[2] as string;
          const entity = this.getValue(path);
          this.call(entity, property);
          return;
        } else {
          const property = ins[1] as string;
          const entity = fromValue(this.stack.pop(), this.game) as any[];
          this.call(entity, property);
          return;
        }
      }
      case 'LOAD': {
        const path = ins[1];
        const value = this.getValue(path);
        this.stack.push(toValue(value));
        return;
      }
      case 'SAVE': {
        const path = ins[1];
        const value = this.stack.pop();
        this.setValue(path, value);
        return;
      }
      case 'ARRAY': {
        const items: Value[] = [];
        for (let i = 0; i < ins[1]; i++) {
          items.push(this.stack.pop() as Value);
        }
        items.reverse();
        this.stack.push({ type: 'ARRAY', items });
        return;
      }
      case 'OBJECT': {
        const obj: Record<string, any> = {};
        for (const property of reverse(ins[1])) {
          obj[property] = this.stack.pop();
        }
        this.stack.push(obj as any);
        return;
      }
      case 'ITERATE': {
        const array = this.stack.pop() as ArrayValue;
        const f = this.stack.pop() as FunctionValue;
        for (const item of array.items) {
          this.instructions.unshift(['PUSH', item], ['PUSH', f], 'CALL');
        }
        return;
      }
      default:
        throw new Error('unknown operator: ' + ins[0]);
    }
  }

  private call(entity: any, property: string) {
    if (entity instanceof StaticAgent) {
      if (property === 'chooseNumber') {
        const max = this.stack.pop() as number;
        const min = this.stack.pop() as number;
        const result = entity.chooseNumber(min, max);
        this.stack.push(result);
        return;
      } else {
        throw new Error('not implemented');
      }
    } else if (entity instanceof InterpretedAgent) {
      if (property === 'chooseNumber') {
        const max = this.stack.pop() as number;
        const min = this.stack.pop() as number;
        this.stack.push({
          type: 'CHOICE',
          min: 1,
          max: 1,
          title: 'Choose number',
          options: Array.from({ length: max - min + 1 }).map((_, i) => ({
            label: (min + i).toString(),
            value: min + i,
          })),
        });
        return;
      } else {
        throw new Error('not implemented');
      }
    }

    if (isArray(entity)) {
      const lambda = this.stack.pop() as any;

      switch (property) {
        case 'filter': {
          const predicate = toJSFunction(lambda) as any;
          const result = entity.filter(predicate);
          this.stack.push(toValue(result));
          return;
        }
        case 'forEach': {
          this.stack.push(...entity.flatMap((e) => [toValue(e), lambda]));
          this.instructions.push(...entity.map(() => 'CALL' as const));
          return;
        }
      }
    } else {
      const method = entity[property];
      const func = toValue(method);
      this.setValue('this', entity);
      this.stack.push(func);
      this.instructions.push('CALL');
      return;
    }
  }

  getValue(path: string): any {
    if (path.startsWith('game')) {
      return get(this, path);
    }

    if (path in this.vars) {
      return fromValue(this.vars[path], this.game);
    }

    let result = this.vars;
    const parts = path.split('.');
    for (const part of parts) {
      if (part in result) {
        result = fromValue(result[part], this.game);
      } else {
        return undefined;
      }
    }

    return result;
  }

  setValue(path: string, value: any) {
    let result = this.vars;
    const parts = path.split('.');
    const property = parts.splice(parts.length - 1)[0];
    for (const part of parts) {
      if (part in result) {
        result = fromValue(result[part], this.game);
      }
    }

    result[property] = toValue(value);
  }

  step(): boolean {
    const next = this.instructions.shift();
    if (next) {
      console.log('execute', next);
      this.execute(next);
      return true;
    } else {
      return false;
    }
  }

  get choice() {
    return this.stack.find((v) => typeof v === 'object' && v.type === 'CHOICE');
  }

  run() {
    let step = 0;
    while (step < 1000 && this.step()) {
      step++;

      if (this.choice) {
        break;
      }
    }

    if (step === 1000) {
      throw new Error('too many steps');
    }

    if (this.choice) {
      return this.choice;
    }

    return this.getResult();
  }

  getResult() {
    if (this.stack.length === 0) {
      return undefined;
    }

    return this.stack[0];
  }

  choose(value: Value | Value[]) {
    const index = this.stack.findIndex(
      (v) => typeof v === 'object' && v.type === 'CHOICE'
    );
    if (index >= 0) {
      this.stack[index] = toValue(value);
    } else {
      throw new Error('no choice');
    }
  }
}
