/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { isArray } from 'lodash';
import { toFunction } from './utils';
import { Env, SExpr } from './types';

const operators: Record<string, unknown> = {
  '+': (a: number, b: number) => a + b,
  '-': (a: number, b: number) => a - b,
  '*': (a: number, b: number) => a * b,
  '>': (a: number, b: number) => a > b,
  '?': <T>(condition: boolean, t: T, f: T) => (condition ? t : f),
  array: (...items: unknown[]) => ['array', ...items],
};

function isFinal(expr: SExpr): boolean {
  if (!isArray(expr)) {
    return true;
  }

  const [operator, ...args] = expr;

  if (operator === 'array') {
    return args.every((e) => isFinal(e));
  }

  if (operator === 'lambda') {
    return true;
  }

  if (operator === 'call') {
    return false;
  }

  if (typeof operator === 'string' && operator in operators) {
    return false;
  }

  if (isArray(expr)) {
    return expr.length === 0;
  }

  return false;
}

export class Interpreter {
  public state: {
    expression: SExpr;
    env: Env;
    stack: Array<{
      operator: string;
      args: Array<{
        expr: SExpr;
        resolved: boolean;
      }>;
    }>;
  };

  constructor(expression: SExpr, env: Env = {}) {
    this.state = {
      expression,
      env,
      stack: [],
    };
  }

  step(): boolean {
    const { expression, stack, env } = this.state;
    const terminal = isFinal(expression);

    if (Array.isArray(expression) && !terminal) {
      const [operator, ...args] = expression;

      if (typeof operator === 'string' && operator in operators) {
        stack.push({
          operator,
          args: args.map((a) => ({
            expr: a,
            resolved: false,
          })),
        });
        this.state.expression = args[0];
        return true;
      } else {
        switch (operator) {
          case '=': {
            stack.push({
              operator,
              args: args.map((a) => ({
                expr: a,
                resolved: false,
              })),
            });
            this.state.expression = args[1];
            return true;
          }
          case 'call': {
            stack.push({
              operator,
              args: [
                { expr: args[0], resolved: false },
                { expr: args[1], resolved: true },
              ],
            });
            this.state.expression = args[0];
            return true;
          }
          default:
            throw new Error(`Unknown operator: ${operator}`);
        }
      }
    } else if (typeof expression === 'string' && expression in env) {
      this.state.expression = env[expression];
      return true;
    } else if (stack.length > 0) {
      const frame = stack[stack.length - 1];
      const resolved = frame.args.find((a) => !a.resolved);
      if (resolved) {
        resolved.expr = expression;
        resolved.resolved = true;
      }

      const unresolved = frame.args.find((a) => !a.resolved);

      if (unresolved) {
        this.state.expression = unresolved.expr;
        return true;
      } else {
        stack.pop();

        const args = frame.args.map((a) => a.expr);

        if (frame.operator === 'call') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const funct = args[0] as any[];
          const functArgNames = funct[1] as string[];
          const functArgValues = args[1] as SExpr[];
          functArgNames.forEach((name, i) => {
            env[name] = functArgValues[i];
          });
          this.state.expression = funct[2];
          return true;
        } else {
          const func = operators[frame.operator];
          if (typeof func !== 'function') {
            throw new Error(`Operator is not a function: ${frame.operator}`);
          }

          this.state.expression = func(...args);
          return true;
        }
      }
    } else {
      return false;
    }
  }

  run() {
    let step = 0;
    while (this.step() || step > 1000) {
      step++;
    }

    if (step === 1000) {
      throw new Error('too many steps');
    }

    return toFunction(this.getResult());
  }

  getResult() {
    return this.state.expression;
  }
}
