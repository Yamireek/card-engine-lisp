/* eslint-disable @typescript-eslint/no-explicit-any */
import { isArray } from 'lodash';

type VarName = `$${string}`;

type NumExpr = number | VarName | ['+', ...NumExpr[]];

type BoolExpr =
  | boolean
  | ['&&' | '||', ...BoolExpr[]]
  | ['>', NumExpr, NumExpr];

type StrExpr = string | ['GET', VarName];

type FuncExp = ['LAMBDA', string[], Code];

type Expr = NumExpr | BoolExpr | StrExpr | FuncExp | ['GET', VarName];

type Stm = ['SET', VarName, Expr] | Stm[];

type Code = Stm | Expr;

type Ins =
  | ['PUSH', any]
  | ['SAVE', VarName]
  | ['LOAD', VarName]
  | BinaryOperator;

function toIns(code: Code): Ins[] {
  if (isArray(code)) {
    const operation = code[0];

    if (isArray(operation)) {
      return code.flatMap(toIns as any);
    }

    switch (operation) {
      case '&&':
      case '||':
      case '>':
      case '+': {
        const [, ...args] = code;
        return [...args.flatMap(toIns), operation];
      }
      case 'SET': {
        const variable = code[1];
        const expr = code[2];

        console.log(code);
        console.log(toIns(expr));

        if (typeof expr === 'string' && expr.startsWith('$')) {
          return [...toIns(expr), ['LOAD', expr as any], ['SAVE', variable]];
        } else {
          return [...toIns(expr), ['SAVE', variable]];
        }
      }
      default:
        return [];
    }
  } else {
    return [['PUSH', code]];
  }
}

function toJs(code: Code): string {
  if (isArray(code)) {
    const operation = code[0];

    if (isArray(operation)) {
      return code.map(toJs as any).join('; ');
    }

    switch (operation) {
      case '&&':
      case '||':
      case '>':
      case '+': {
        const [, ...args] = code;
        return `(${args.map(toJs).join(` ${operation} `)})`;
      }
      case 'SET': {
        return 'let ' + code[1] + ' = ' + toJs(code[2]);
      }
      default:
        return 'unknown';
    }
  } else {
    if (typeof code === 'string' && code.startsWith('$')) {
      return code;
    }

    return JSON.stringify(code);
  }
}

type BinaryOperator = '+' | '>' | '&&' | '||';

const operations: Record<BinaryOperator, (...args: any[]) => any> = {
  '+': (a, b) => a + b,
  '>': (a, b) => a > b,
  '&&': (a, b) => a && b,
  '||': (a, b) => a || b,
};

class Interpreter {
  public stack: any[] = [];
  public env: Record<string, any> = {};

  constructor(public instructions: Ins[]) {}

  private execute(ins: Ins) {
    if (typeof ins === 'string') {
      switch (ins) {
        case '+':
        case '>': {
          console.log(this.stack);
          const b = this.stack.pop() as number;
          const a = this.stack.pop() as number;
          this.stack.push(operations[ins](a, b));
          return;
        }
        default:
          throw new Error('Unknown instruction: ' + JSON.stringify(ins));
      }
    } else {
      const operation = ins[0];
      switch (operation) {
        case 'PUSH': {
          const param = ins[1];
          if (typeof param === 'string' && param.startsWith('$')) {
            const value = this.env[param];
            console.log(param, value);
            this.stack.push(value);
            console.log(this.stack);
          } else {
            this.stack.push(param);
            return;
          }
          break;
        }
        case 'SAVE': {
          this.env[ins[1]] = this.stack.pop();
          return;
        }
        case 'LOAD': {
          this.stack.push(this.env[ins[1]]);
          return;
        }
        default:
          throw new Error('Unknown instruction: ' + JSON.stringify(ins));
      }
    }
  }

  step() {
    const next = this.instructions.shift();
    if (next) {
      console.log('execute', next);
      this.execute(next);
      return true;
    } else {
      return false;
    }
  }

  run() {
    while (this.step()) {
      /* empty */
    }

    return this.stack[0];
  }
}

const code: Code = [
  ['SET', '$A', 1],
  ['SET', '$B', ['+', 2, '$A']],
];

it('test', () => {
  console.log(toJs(code));
  console.log(toIns(code));

  const int = new Interpreter(toIns(code));
  console.log(int.run());
  console.log(int.env);
});
