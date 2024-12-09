/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { at, get, isArray, set } from 'lodash';
import { toFunction, toLisp } from './utils';
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

  if (operator === 'property') {
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
    expression: any;
    env: Env;
    stack: Array<{
      operator: string;
      args: Array<{
        expr: any;
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
    const terminal = expression === undefined || isFinal(expression);

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
              args: [
                { expr: args[0], resolved: true },
                { expr: args[1], resolved: false },
              ],
            });
            this.state.expression = args[1];
            return true;
          }
          case 'call': {
            const resolvedFirst =
              isArray(args[0]) &&
              (args[0][0] === 'property' || args[0][0] === 'lambda');

            const argsExpr = ['array', ...args[1]];
            stack.push({
              operator,
              args: [
                {
                  expr: args[0],
                  resolved: resolvedFirst,
                },
                { expr: argsExpr, resolved: false },
              ],
            });
            this.state.expression = !resolvedFirst ? args[0] : argsExpr;
            return true;
          }
          default:
            throw new Error(`Unknown operator: ${operator}`);
        }
      }
    } else if (typeof expression === 'string') {
      this.state.expression = get(env, expression);
      return true;
    } else if (
      isArray(expression) &&
      expression[0] === 'property' &&
      typeof expression[1] === 'string'
    ) {
      this.state.expression = get(env, expression[1]);
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

        switch (frame.operator) {
          case 'call': {
            const funct = args[0] as any[];
            switch (funct[0]) {
              case 'lambda': {
                const functArgNames = funct[1] as string[];
                const functArgValues = args[1].splice(1);
                functArgNames.forEach((name, i) => {
                  env[name] = functArgValues[i];
                });
                this.state.expression = funct[2];
                return true;
              }
              case 'property': {
                const method = get(env, funct[1]) as Function;
                const methodArgs = args[1] as SExpr[];
                const code = method.toString();
                const lisp = toLisp(code);
                this.state.expression = ['call', lisp, methodArgs.splice(1)];
                return true;
              }
              default:
                throw new Error('unknown function type:' + funct[0]);
            }
          }
          case 'property': {
            const path = args[0] as string;
            this.state.expression = get(env, path);
            return true;
          }
          case '=': {
            const path = (args[0] as any)[1] as any;
            const value = args[1] as any;
            set(env, path, value);
            this.state.expression = value;
            return true;
          }
          default: {
            const func = operators[frame.operator];
            if (typeof func !== 'function') {
              throw new Error(`Operator is not a function: ${frame.operator}`);
            }

            this.state.expression = func(...args);
            return true;
          }
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

    const result = this.getResult();
    if (!result) {
      return;
    } else {
      return toFunction(result);
    }
  }

  getResult() {
    return this.state.expression;
  }
}
