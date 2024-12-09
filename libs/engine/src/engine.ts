import { isArray } from 'lodash';
import { SExpr, toFunction } from './parser2';

type LispValue = any;

const operators: Record<string, any> = {
  '+': (a: number, b: number) => a + b,
  '-': (a: number, b: number) => a - b,
  '*': (a: number, b: number) => a * b,
  '>': (a: number, b: number) => a > b,
  '?': <T>(condition: boolean, t: T, f: T) => (condition ? t : f),
  array: (...items: any[]) => ['array', ...items],
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

export class LispInterpreter {
  public state: {
    expression: LispValue;
    env: any;
    stack: Array<{
      operator: string;
      args: Array<{
        expr: SExpr;
        resolved: boolean;
      }>;
    }>;
  };

  constructor(expression: LispValue, env: any = {}) {
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
      // Resolve variable name
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

        if (frame.operator === '=') {
          const varName = args[0] as string;
          const varValue = args[1] as SExpr;
          env[varName] = varValue;
          this.state.expression = undefined;
          return true;
        }
        if (frame.operator === 'call') {
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

  getResult(): LispValue {
    return this.state.expression;
  }
}

// const a = toLisp("2+1");
// console.log(JSON.stringify(a));

// const i = new Interpreter(a, {});
// while (i.state.running == "paused") {
//   console.log(i.step());
// }

// const i2 = new LispInterpreter(
//   toLisp("((f => n => n > 0 ? n + f(n - 1) : 0)(n => n))(5)")
// );
// let i = 0;
// while (i2.step() && i < 200) {
//   i++;
//   console.log("i: ", i);
//   //console.log(i2.state.expression, i2.state.stack);
// }
// console.log("Result:", i2.getResult());

// const interpreter = new LispInterpreter(toLisp("1+2"));
// const result = interpreter.run();
// console.log(result);
