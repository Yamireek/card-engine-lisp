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
import { BinaryOperator, Instruction } from './types';

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
      return [['PUSH', ['FUNCTION', '', params, toInstructions(value.body)]]];
    }
    case 'IfStatement': {
      const test = toInstructions(value.test);
      const ifTrue = toInstructions(value.consequent);
      const ifFalse = value.alternate ? toInstructions(value.alternate) : [];
      return [['PUSH', ifTrue], ['PUSH', ifFalse], ...test, 'IF'];
    }
    case 'ReturnStatement': {
      if (value.argument) {
        return [...toInstructions(value.argument), ['RETURN']];
      } else {
        return [['RETURN']];
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
          [
            'FUNCTION',
            name,
            params,
            value.body ? toInstructions(value.body) : [],
          ],
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
        ['CALL'],
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
      return [['PUSH', ifTrue], ['PUSH', ifFalse], ...test, 'IF'];
    }
    case 'BlockStatement':
      return value.body.flatMap(toInstructions);
    case 'Literal':
      if (typeof value.value === 'number' || typeof value.value === 'boolean') {
        return [['PUSH', value.value]];
      } else {
        throw new Error('not supported literal type:' + typeof value.value);
      }
    case 'ArrayExpression':
      return value.elements.flatMap((e) => (e ? toInstructions(e) : []));
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
