/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { parse } from 'meriyah';
import { isArray } from 'lodash';
import {
  Expression,
  Parameter,
  PrivateIdentifier,
  Program,
  Statement,
  VariableDeclarator,
} from 'meriyah/dist/src/estree';
import { BinaryOperator, FunctionValue, Instruction, Value } from './types';

export function asArray<T>(items: T | T[]): T[] {
  if (isArray(items)) {
    return items;
  }

  return [items];
}

export function toPath(value: Expression | PrivateIdentifier): string {
  switch (value.type) {
    case 'Identifier':
      return value.name;
    case 'ThisExpression':
      return 'this';
    case 'MemberExpression':
      return `${toPath(value.object)}.${toPath(value.property)}`;
  }

  throw new Error('uknown memeber path: ' + value.type);
}

export function toInstructions<F extends Function>(
  value:
    | F
    | string
    | Program
    | Statement
    | Expression
    | Parameter
    | VariableDeclarator
    | PrivateIdentifier
): Instruction[] {
  if (typeof value === 'function' || typeof value === 'string') {
    const source = value.toString();
    const parsed = parse(source);
    return parsed.body.flatMap(toInstructions);
  }

  if (isArray(value)) {
    return value.flatMap(toInstructions);
  }

  switch (value.type) {
    case 'Program':
      return value.body.flatMap(toInstructions);
    case 'ExpressionStatement':
      return toInstructions(value.expression);
    case 'ArrowFunctionExpression': {
      const params = value.params.map((p) =>
        p.type === 'Identifier' ? p.name : 'unknown'
      );
      return [
        [
          'PUSH',
          {
            type: 'FUNCTION',
            name: '',
            parameters: params,
            body: toInstructions(value.body),
          },
        ],
      ];
    }
    case 'IfStatement': {
      const test = toInstructions(value.test);
      const ifTrue = toInstructions(value.consequent);
      const ifFalse = value.alternate ? toInstructions(value.alternate) : [];
      return [
        ['PUSH', { type: 'INSTRUCTIONS', body: ifTrue }],
        ['PUSH', { type: 'INSTRUCTIONS', body: ifFalse }],
        ...test,
        'IF',
      ];
    }
    case 'ReturnStatement': {
      if (value.argument) {
        return [...toInstructions(value.argument), 'RETURN'];
      } else {
        return ['RETURN'];
      }
    }
    case 'FunctionDeclaration': {
      const params = value.params.map((p) =>
        p.type === 'Identifier' ? p.name : 'unknown'
      );
      const name = value.id?.name ?? '';

      const f: Instruction[] = [
        [
          'PUSH',
          {
            type: 'FUNCTION',
            name,
            parameters: params,
            body: value.body ? toInstructions(value.body) : [],
          },
        ],
      ];

      if (name) {
        f.push(['SAVE', name]);
      }

      return f;
    }
    case 'Identifier':
      return [['LOAD', value.name]];
    case 'CallExpression':
      return [
        ...value.arguments.flatMap(toInstructions),
        ...toInstructions(value.callee),
        'CALL',
      ];
    case 'MemberExpression':
      return [['LOAD', toPath(value)]];
    case 'AssignmentExpression': {
      const path = toPath(value.left);
      const result = toInstructions(value.right);
      return [...result, ['SAVE', path]];
    }
    case 'BinaryExpression': {
      const l = toInstructions(value.left);
      const r = toInstructions(value.right);
      return [...l, ...r, value.operator as BinaryOperator];
    }
    case 'ConditionalExpression': {
      const test = toInstructions(value.test);
      const ifTrue = toInstructions(value.consequent);
      const ifFalse = value.alternate ? toInstructions(value.alternate) : [];
      return [
        ['PUSH', { type: 'INSTRUCTIONS', body: ifTrue }],
        ['PUSH', { type: 'INSTRUCTIONS', body: ifFalse }],
        ...test,
        '?',
      ];
    }
    case 'BlockStatement':
      return value.body.flatMap(toInstructions);
    case 'Literal':
      if (
        typeof value.value === 'number' ||
        typeof value.value === 'boolean' ||
        typeof value.value === 'string'
      ) {
        return [['PUSH', value.value]];
      } else {
        throw new Error('not supported literal type:' + typeof value.value);
      }
    case 'ArrayExpression': {
      const length = value.elements.length;
      return [
        ...value.elements.flatMap((e) => (e ? toInstructions(e) : [])),
        ['ARRAY', length],
      ];
    }
    case 'VariableDeclaration': {
      return value.declarations.flatMap(toInstructions);
    }
    case 'VariableDeclarator':
      if (value.init) {
        return [
          ...toInstructions(value.init),
          ['SAVE', value.id.type === 'Identifier' ? value.id.name : 'unknown'],
        ];
      } else {
        return [];
      }
    case 'ForOfStatement': {
      const name =
        value.left.type === 'VariableDeclaration'
          ? value.left.declarations
              .map((d) =>
                d.type === 'VariableDeclarator'
                  ? d.id.type === 'Identifier'
                    ? d.id.name
                    : ''
                  : ''
              )
              .join('')
          : '';
      const body = toInstructions(value.body);
      const path = toPath(value.right);
      return [
        ['PUSH', { type: 'FUNCTION', name: '', parameters: [name], body }],
        ['LOAD', path],
        ['ITERATE', name],
      ];
    }
    default:
      throw new Error('unknown ast type:' + value.type);
  }
}

export function simpleMap<A, B>(items: A[], mapper: (item: A) => B): B | B[] {
  if (items.length === 1) {
    return mapper(items[0]);
  } else {
    return items.map(mapper);
  }
}

export function valueToString(value: Value): string {
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'string'
  ) {
    return value.toString();
  }

  if (value === undefined) {
    return 'undefined';
  }

  if (value.type === 'FUNCTION') {
    return `(${value.name}(${value.parameters}) => ${toCode(
      asArray(value.body)
    )})`;
  }

  if (value.type === 'INSTRUCTIONS') {
    return toCode(value.body);
  }

  if (value.type === 'ARRAY') {
    return `[${value.items.map(valueToString).join(', ')}]`;
  }

  return `unknown value: ${JSON.stringify(value)}`;
}

export function valueToJs(value: Value): any {
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'string'
  ) {
    return value;
  }

  if (value.type === 'ARRAY') {
    return value.items.map(valueToJs);
  }

  return `unknown value: ${JSON.stringify(value)}`;
}

export function toJSFunction(
  f: FunctionValue,
  args: Array<{ name: string; value: any }>
): Function {
  const code = `return (${f.parameters})=>(${toCode(f.body)})`;
  console.log(code);

  // const fx = new Function('predicate', 'return (c)=>(predicate(c))');
  // const f2 = fx();
  // const code2 = f2.toString();
  // console.log(code2);

  const jsF = new Function('predicate', code);
  return jsF(...args.map((a) => a.value));
}

export function toCode(commands: Instruction[], values: Value[] = []): string {
  const stack = values.map(valueToString);

  for (const command of commands) {
    if (typeof command === 'string') {
      switch (command) {
        case '+':
        case '-':
        case '*':
        case '/':
        case '<=':
        case '<':
        case '==': {
          const b = stack.pop();
          const a = stack.pop();
          stack.push(`(${a} ${command} ${b})`);
          break;
        }
        case 'IF': {
          const c = stack.pop();
          const b = stack.pop();
          const a = stack.pop();
          stack.push(`(${c} ? ${a} : ${b})`);
          break;
        }
        case 'CALL': {
          const f = stack.pop();
          const args = stack.pop();
          stack.push(`${f}(${args})`);
          break;
        }
        default:
          return 'unknown:' + JSON.stringify(command);
      }
    } else {
      const [operator, arg] = command;

      switch (operator) {
        case 'PUSH':
          stack.push(valueToString(command[1]));
          break;
        case 'LOAD': {
          stack.push(arg);
          break;
        }
        case 'SAVE': {
          const v = stack.pop() as string;
          stack.push(`${arg} = ${v}`);
          break;
        }
        case 'ITERATE': {
          const path = stack.pop();
          const f = stack.pop();
          stack.push(`${path}.forEach(${f})`);
          break;
        }
        default:
          return 'unknown:' + JSON.stringify(command);
      }
    }
  }

  return stack[0];
}

export function values<TK extends string | number, TI>(
  records?: Partial<Record<TK, TI>>
) {
  if (!records) {
    return [];
  }
  return Object.values(records) as TI[];
}

export function keys<TK extends string | number, TI>(
  records?: Partial<Record<TK, TI>>
): TK[] {
  if (!records) {
    return [];
  }
  return Object.keys(records).filter(
    (k) => records[k as TK] !== undefined
  ) as TK[];
}
