/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, isArray, set } from 'lodash';
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

  constructor(
    public instructions: Instruction[],
    public globals: Env = {},
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
              this.globals[arg] = value;
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
          const entity = get(this.globals, path) as any;

          if (isArray(entity)) {
            const lambda = this.stack.pop() as any;
            const predicate = toJSFunction(lambda);
            const result = entity[property as any](predicate);
            this.stack.push(toValue(result));
            return;
          } else {
            const method = entity[property];
            const func = toValue(method);
            this.globals['this'] = entity;
            this.stack.push(func);
            this.instructions.push('CALL');
            return;
          }
        } else {
          const property = ins[1] as string;
          const entity = fromValue(
            this.stack.pop(),
            this.globals['game']
          ) as any[];

          if (isArray(entity)) {
            const lambda = this.stack.pop() as any;
            const predicate = toJSFunction(lambda).bind(entity) as Function;
            const result = entity[property as any](predicate);
            this.stack.push(toValue(result));
            return;
          } else {
            throw new Error('not implemented');
          }
        }
      }
      case 'LOAD': {
        const path = ins[1];
        const value = get(this.globals, path);
        this.stack.push(toValue(value));
        return;
      }
      case 'SAVE': {
        const path = ins[1];
        const value = this.stack.pop();
        set(this.globals, path, value);
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
