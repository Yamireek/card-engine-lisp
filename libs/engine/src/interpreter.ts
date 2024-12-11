/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, isArray, set } from 'lodash';
import {
  BinaryOperator,
  Env,
  FunctionValue,
  Instruction,
  Value,
} from './types';
import { toInstructions } from './utils';
import { makeAutoObservable } from 'mobx';

const operations: Record<BinaryOperator, (...args: any[]) => Value> = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
  '==': (a, b) => a == b,
  '<=': (a, b) => a <= b,
};

function replaceThis(path: string, ins: Instruction): Instruction {
  if (typeof ins === 'string') {
    return ins;
  }

  switch (ins[0]) {
    case 'SAVE':
    case 'LOAD': {
      return [ins[0], ins[1].replace('this.', path + '.')];
    }
    case 'PUSH':
      if (isArray(ins[1]) && ins[1][0] === 'FUNCTION') {
        return [
          'PUSH',
          [
            ins[1][0],
            ins[1][1],
            ins[1][2],
            isArray(ins[1][3])
              ? ins[1][3].map((i) => replaceThis(path, i as any))
              : (replaceThis(path, ins[1][3]) as any),
          ],
        ];
      }
      return ins;
    default:
      return ins;
  }
}

export class Interpreter {
  public stack: Value[] = [];

  constructor(public instructions: Instruction[], public globals: Env = {}) {
    console.log(JSON.stringify(instructions, null, 1));
    makeAutoObservable(this);
  }

  private execute(ins: Instruction) {
    if (typeof ins === 'string') {
      switch (ins) {
        case '+':
        case '-':
        case '*':
        case '/':
        case '==':
        case '<=': {
          const b = this.stack.pop() as number;
          const a = this.stack.pop() as number;
          this.stack.push(operations[ins](a, b));
          return;
        }
        case 'IF': {
          const result = this.stack.pop() as boolean;
          const ifFalse = this.stack.pop() as Instruction[];
          const ifTrue = this.stack.pop() as Instruction[];
          this.instructions.unshift(...(result ? ifTrue : ifFalse));
          return;
        }
      }
    }

    switch (ins[0]) {
      case 'PUSH': {
        const value = ins[1];
        this.stack.push(value);
        return;
      }
      case 'LOAD': {
        const path = ins[1];
        const value = get(this.globals, path);
        if (typeof value === 'function') {
          const code = value.toString() as string;
          const entityPath = path.slice(0, path.lastIndexOf('.')) || path;
          const func = replaceThis(
            entityPath,
            toInstructions(code.startsWith('(') ? code : `function ${code}`)[0]
          ) as any;
          this.stack.push(func[1]);
        } else {
          this.stack.push(value);
        }

        return;
      }
      case 'SAVE': {
        const path = ins[1];
        const value = this.stack.pop();
        set(this.globals, path, value);
        return;
      }
      case 'CALL': {
        const func = this.stack.pop() as FunctionValue;
        for (const arg of func[2]) {
          const value = this.stack.pop();
          if (value) {
            this.globals[arg] = value;
          }
        }
        this.instructions.unshift(...func[3]);
        return;
      }
      case 'RETURN': {
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
    if (this.stack.length === 1) {
      return this.stack[0];
    } else {
      return this.stack;
    }
  }
}
