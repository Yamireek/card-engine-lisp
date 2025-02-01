/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, isArray, set } from 'lodash';
import {
  BinaryOperator,
  Env,
  FunctionValue,
  Instruction,
  InstructionsValue,
  Value,
} from './types';
import { fromValue, remove, repeat, toJSFunction, toValue } from './utils';
import { makeAutoObservable } from 'mobx';
import { clone, last, reverse } from 'ramda';
import { StaticAgent } from './agent/StaticAgent';
import { InterpretedAgent } from './agent/InterpretedAgent';
import { State } from './state/State';
import { Game } from './entity';
import { CardsRepo } from './repo';

const operations: Record<BinaryOperator, (...args: any[]) => any> = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
  '===': (a, b) => a === b,
  '!==': (a, b) => a !== b,
  '==': (a, b) => a == b,
  '<=': (a, b) => a <= b,
  '<': (a, b) => a < b,
};

export class Interpreter {
  public stack: any[] = [];

  public frames: Env[] = [{}];

  static fromJson(state: State, repo: CardsRepo) {
    const cloned = clone(state);
    const game = new Game(repo, {
      type: 'json',
      data: state.game,
    });
    const interpreter = new Interpreter(cloned.instructions, game, false);
    interpreter.stack = cloned.stack.map((v) => fromValue(v, game));
    interpreter.frames = cloned.frames;
    return interpreter;
  }

  toJSON(): State {
    return {
      game: this.game.toJSON(),
      stack: this.stack.map((v) => toValue(v)),
      frames: this.frames,
      instructions: this.instructions,
    };
  }

  constructor(
    public instructions: Instruction[],
    public game: Game,
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
        case 'FRAME_BEGIN':
          this.frames.push({});
          return;
        case 'FRAME_END':
          this.frames.pop();
          return;
        default:
          return `unknown instruction: ${ins}`;
      }
    }

    switch (ins[0]) {
      case 'PUSH': {
        const value = ins[1];
        this.stack.push(value);
        return;
      }
      case 'CALL': {
        if (ins.length === 4) {
          const path = ins[1];
          const property = ins[2];
          const entity = this.getValue(path);
          this.call(entity, property);
          return;
        } else {
          const property = ins[1];
          const entity = this.stack.pop();
          this.call(entity, property);
          return;
        }
      }
      case 'LOAD': {
        const path = ins[1];
        switch (path) {
          case 'repeat': {
            const f = this.stack.pop();
            const a = this.stack.pop();
            repeat(a, () => {
              this.stack.push(f);
              this.instructions.unshift('CALL');
            });
            this.instructions.shift();
            return;
          }
          case 'remove': {
            const item = this.stack.pop();
            const array = this.stack.pop();
            remove(array, item);
            this.instructions.shift();
            return;
          }
          default: {
            const value = this.getValue(path);
            this.stack.push(value);
            return;
          }
        }
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
        const array = this.stack.pop();
        const f = this.stack.pop();
        for (const item of array) {
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
        const max = this.stack.pop();
        const min = this.stack.pop();
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
      switch (property) {
        case 'filter': {
          const lambda = this.stack.pop() as any;
          const predicate = toJSFunction(lambda) as any;
          const result = entity.filter(predicate);
          this.stack.push(result);
          return;
        }
        case 'forEach': {
          const lambda = this.stack.pop() as any;
          this.stack.push(...entity.flatMap((e) => [e, lambda]));
          this.instructions.unshift(...entity.map(() => 'CALL' as const));
          return;
        }
        case 'push': {
          const item = this.stack.pop() as any;
          entity.push(item);
          return;
        }
        default:
          throw new Error('not implemented: ' + property);
      }
    } else {
      const method = entity[property];
      const func = toValue(method);
      this.setValue('this', entity);
      this.stack.push(func);
      this.instructions.unshift('CALL');
      return;
    }
  }

  getValue(path: string): any {
    if (path.startsWith('game')) {
      return get(this, path);
    }

    const parts = path.split('.');
    const frame = reverse(this.frames).find((f) => parts[0] in f);

    if (frame) {
      return get(frame, path);
    } else {
      return undefined;
    }
  }

  setValue(path: string, value: any) {
    const parts = path.split('.');

    const frame =
      parts.length > 1
        ? reverse(this.frames).find((f) => parts[0] in f) ?? last(this.frames)
        : last(this.frames);

    if (frame) {
      set(frame, path, value);
    } else {
      throw new Error('no frame');
    }
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
