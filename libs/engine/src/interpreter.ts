/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, set } from 'lodash';
import {
  BinaryOperator,
  Env,
  FunctionValue,
  Instruction,
  InstructionsValue,
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
    case 'PUSH': {
      const v = ins[1];
      if (typeof v === 'object' && v.type === 'FUNCTION') {
        return [
          'PUSH',
          { ...v, body: v.body.map((i) => replaceThis(path, i)) },
        ];
      }
      return ins;
    }
    default:
      return ins;
  }
}

export class Interpreter {
  public stack: Value[] = [];

  constructor(public instructions: Instruction[], public globals: Env = {}) {
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
          for (const arg of func.parameters) {
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
