/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { parse } from 'meriyah';
import { isArray } from 'lodash';
import {
  Expression,
  MemberExpression,
  Parameter,
  PrivateIdentifier,
  Program,
  Statement,
  VariableDeclarator,
} from 'meriyah/dist/src/estree';
import { BinaryOperator, FunctionValue, Instruction, Value } from './types';
import { Entity } from './Game';

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
    case 'CallExpression': {
      if (value.callee.type === 'MemberExpression') {
        const me = value.callee as MemberExpression;
        if (
          me.object.type === 'Identifier' ||
          me.object.type === 'MemberExpression'
        ) {
          const obj = toPath(me.object);
          const prop = toPath(me.property);
          return [
            ...value.arguments.flatMap(toInstructions),
            ['CALL', obj, prop],
          ];
        } else {
          const params = value.arguments.flatMap(toInstructions);
          const calle = toInstructions(me.object);
          return [...params, ...calle, ['CALL', toPath(me.property)]];
        }
      } else {
        return [
          ...value.arguments.flatMap(toInstructions),
          ...toInstructions(value.callee),
          'CALL',
        ];
      }
    }
    case 'MemberExpression':
      if (value.object.type !== 'CallExpression') {
        return [['LOAD', toPath(value)]];
      } else {
        return [
          ...toInstructions(value.object),
          [
            'PUSH',
            {
              type: 'FUNCTION',
              name: toPath(value.property),
              parameters: ['action', 'items'],
              body: [],
            },
          ],
        ];
      }

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
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString();
  }

  if (typeof value === 'string') {
    return `"${value}"`;
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

  if (value.type === 'REFERENCE') {
    return `${value.entity}[${value.id}]`;
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

  if (value === undefined) {
    return undefined;
  }

  if (value.type === 'ARRAY') {
    return value.items.map(valueToJs);
  }

  return `unknown value: ${JSON.stringify(value)}`;
}

export function toJSFunction(
  f: FunctionValue,
  args: Array<{ name: string; value: any }> = []
): Function {
  const code = `return (${f.parameters})=>(${toCode(f.body)})`;
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
        case '==':
        case '===': {
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
          stack.push(`${f}(${args === '[]' ? '' : args})`);
          break;
        }
        default:
          return 'unknown:' + JSON.stringify(command);
      }
    } else {
      const [operator, ...args] = command as any;

      switch (operator) {
        case 'PUSH':
          stack.push(valueToString(command[1]));
          break;
        case 'LOAD': {
          stack.push(args[0]);
          break;
        }
        case 'SAVE': {
          const v = stack.pop() as string;
          stack.push(`${args[0]} = ${v}`);
          break;
        }
        case 'ITERATE': {
          const path = stack.pop();
          const f = stack.pop();
          stack.push(`${path}.forEach(${f})`);
          break;
        }
        case 'CALL': {
          const a = stack.pop();
          stack.push(`${args[0]}.${args[1]}(${a === '[]' ? '' : a})`);
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

export function fromValue(value: Value, game: any): any {
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'string'
  ) {
    return value;
  }

  if (value === undefined) {
    return undefined;
  }

  if (value.type === 'ARRAY') {
    return value.items.map((v) => fromValue(v, game));
  }

  if (value.type === 'REFERENCE') {
    return game[value.entity][value.id];
  }

  throw new Error('not implemented');
}

export function toValue(input: unknown): Value {
  if (isArray(input)) {
    return {
      type: 'ARRAY',
      items: input.map(toValue),
    };
  }

  if (
    typeof input === 'boolean' ||
    typeof input === 'number' ||
    typeof input === 'string'
  ) {
    return input;
  }

  if (typeof input === 'function') {
    const code = input.toString();
    const parsed = toInstructions(
      code.startsWith('(') ? code : `function ${code}`
    ) as any;
    return parsed[0][1];
  }

  if (input instanceof Entity) {
    return {
      type: 'REFERENCE',
      entity: input.entity,
      id: input.id,
    };
  }

  if (typeof input === 'object') {
    return input as any;
  }

  if (input === undefined) {
    return 'undefined';
  }

  throw new Error('unknown input value: ' + JSON.stringify(input));
}
