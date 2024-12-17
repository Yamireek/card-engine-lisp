/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, isArray } from 'lodash';
import {
  ArrayValue,
  BinaryOperator,
  Env,
  FunctionValue,
  Instruction,
  InstructionsValue,
  Value,
} from './types';
import { fromValue, toJSFunction, toValue } from './utils';
import { makeAutoObservable, toJS } from 'mobx';
import { reverse } from 'ramda';
import { Entity } from './Game';

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

  constructor(
    public instructions: Instruction[],
    public game?: Entity<'game'>,
    public observable = false
  ) {
    if (observable) {
      makeAutoObservable(this);
    }
  }

  private execute(ins: Instruction) {
    console.log('execute', toJS(ins));
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
      this.execute(next);
      return true;
    } else {
      return false;
    }
  }

  run() {
    let step = 0;
    while (step < 1000 && this.step()) {
      step++;
    }

    if (step === 1000) {
      throw new Error('too many steps');
    }

    return this.getResult();
  }

  getResult() {
    if (this.stack.length === 0) {
      return undefined;
    }

    return this.stack[0];
  }
}
