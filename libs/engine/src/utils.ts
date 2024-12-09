/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { parse } from 'meriyah';
import { get, isArray } from 'lodash';
import {
  Expression,
  Parameter,
  PrivateIdentifier,
  Program,
  Statement,
  VariableDeclarator,
} from 'meriyah/dist/src/estree';
import { Env, SExpr } from './types';

export function toPropertyPath(value: Expression | PrivateIdentifier): SExpr {
  switch (value.type) {
    case 'Identifier':
      return value.name;
    case 'MemberExpression':
      return `${toPropertyPath(value.object)}.${toPropertyPath(
        value.property
      )}`;
  }

  return ['property', 'unknown'];
}

export function toLisp<F extends Function>(
  value:
    | F
    | string
    | Program
    | Statement
    | Expression
    | Parameter
    | VariableDeclarator
    | PrivateIdentifier
): SExpr {
  if (typeof value === 'function' || typeof value === 'string') {
    const source = value.toString();
    const parsed = parse(source);
    return simpleMap(parsed.body, toLisp);
  }

  if (isArray(value)) {
    return simpleMap(value, toLisp);
  }

  switch (value.type) {
    case 'Program':
      return simpleMap(value.body, toLisp);
    case 'ExpressionStatement':
      return toLisp(value.expression);
    case 'ArrowFunctionExpression':
      return ['lambda', value.params.map(toLisp), toLisp(value.body)];
    case 'Identifier':
      return value.name;
    case 'CallExpression':
      return ['call', toLisp(value.callee), value.arguments.map(toLisp)];
    case 'MemberExpression':
      return ['property', toPropertyPath(value)];
    case 'AssignmentExpression':
      return [value.operator, toLisp(value.left), toLisp(value.right)];
    case 'WhileStatement':
      return ['while', toLisp(value.test), toLisp(value.body)];
    case 'BinaryExpression':
      return [value.operator, toLisp(value.left), toLisp(value.right)];
    case 'ConditionalExpression':
      return [
        '?',
        toLisp(value.test),
        toLisp(value.consequent),
        toLisp(value.alternate),
      ];
    case 'ArrayPattern':
      return ['array', ...value.elements.map(toLisp)];
    case 'VariableDeclaration':
      if (value.declarations.length === 1) {
        const d = value.declarations[0];
        return d.init
          ? [value.kind, toLisp(d.id), toLisp(d.init)]
          : [value.kind, toLisp(d.id)];
      } else {
        return value.declarations.map((d) =>
          d.init
            ? [value.kind, toLisp(d.id), toLisp(d.init)]
            : [value.kind, toLisp(d.id)]
        );
      }
    case 'FunctionDeclaration':
      return [
        'lambda',
        simpleMap(value.params, toLisp),
        value.body ? toLisp(value.body) : [],
      ];
    case 'BlockStatement':
      return simpleMap(value.body, toLisp);
    case 'Literal':
      if (typeof value.value === 'string') {
        return ['str', value.value];
      }
      if (typeof value.value === 'number' || typeof value.value === 'boolean') {
        return value.value;
      } else {
        throw new Error('not supported literal type:' + typeof value.value);
      }
    case 'ArrayExpression':
      return ['array', ...value.elements.map((e) => (e ? toLisp(e) : []))];
    case 'ReturnStatement':
      if (value.argument) {
        return ['return', toLisp(value.argument)];
      } else {
        return ['return'];
      }
    case 'ThisExpression':
      return ['this'];
    default:
      return ['unknown', value.type];
  }
}

export function toCode(expr: SExpr): string {
  if (typeof expr === 'number') {
    return expr.toString();
  }

  if (typeof expr === 'boolean') {
    return expr ? 'true' : 'false';
  }

  if (typeof expr === 'string') {
    return expr;
  }

  const [operator, ...args] = expr;

  switch (operator) {
    case 'lambda':
      return `(${asArray(args[0]).map(toCode).join(', ')}) => ${toCode(
        args[1]
      )}`;
    case '+':
      return args.map((a) => toCode(a)).join(' + ');
    case 'array':
      return `[${args.map((a) => toCode(a)).join(', ')}]`;
    case 'property':
      return args[0] as string;
  }

  throw new Error('unknown expr' + JSON.stringify(expr));
}

export function asArray<T>(items: T | T[]): T[] {
  if (isArray(items)) {
    return items;
  }

  return [items];
}

export function simpleMap<A, B>(items: A[], mapper: (item: A) => B): B | B[] {
  if (items.length === 1) {
    return mapper(items[0]);
  } else {
    return items.map(mapper);
  }
}

export function toFunction<F extends Function>(e: SExpr, env?: Env): F {
  const code = `return ${toCode(e)}`;
  const vars = env ? Object.keys(env) : [];
  const f = new Function(...vars, code);
  const values = vars.map((v) => get(env, v));
  return f(...values);
}
