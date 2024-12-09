import { describe, expect, it } from 'vitest';
import { Interpreter } from './interpreter';
import { toLisp } from './utils';
import { Env } from './types';

function evaluate(code: string, env: Env = {}) {
  const interpreter = new Interpreter(toLisp(code), env);
  const interpreted = interpreter.run();
  return interpreted;
}

describe('binary expressions', () => {
  it('numbers expression', () => {
    expect(evaluate('1+2')).toBe(3);
  });

  it('numbers braces', () => {
    expect(evaluate('(1+2)*3+4')).toBe(13);
  });
});

describe('variables', () => {
  it('var in expression', () => {
    expect(evaluate('a+a', { a: 2 })).toBe(4);
  });

  it('var in array', () => {
    expect(evaluate('[a,a*2]', { a: 2 })).toStrictEqual([2, 4]);
  });
});

describe('arrays', () => {
  it('simple array', () => {
    expect(evaluate('[1,2,3]')).toStrictEqual([1, 2, 3]);
  });

  it('expressions in array', () => {
    expect(evaluate('[1+2,3]')).toStrictEqual([3, 3]);
  });
});

describe('lambdas', () => {
  it('lambda definition', () => {
    evaluate('() => 1');
  });

  it('lambda call', () => {
    expect(evaluate('(() => 1)()')).toBe(1);
  });

  it('lambda parameter', () => {
    expect(evaluate('((a) => a + 1)(1)')).toBe(2);
  });

  it('multiple lambdas', () => {
    expect(evaluate('(() => () => 1)()()')).toBe(1);
  });

  it('multiple lambda parameters', () => {
    expect(evaluate('((a) => (b) => a + b)(1+1)(2)')).toBe(4);
  });

  it('lambda as parameter', () => {
    expect(evaluate('(f => f())(() => 1)')).toBe(1);
  });

  it('single lambda with two parameters', () => {
    expect(evaluate('((a,b)=>a+b)(1+2,3)')).toBe(6);
  });
});

describe('objects', () => {
  it('read property', () => {
    expect(evaluate('a.b.c', { a: { b: { c: 1 } } })).toBe(1);
  });

  it('write property', () => {
    const obj = { a: { b: 1 } };
    evaluate('obj.a.b = 5 * 5', { obj });
    expect(obj.a.b).toBe(25);
  });

  it('call object function', () => {
    const obj = {
      a: 1,
      b: (v1: number, v2: number) => {
        obj.a = obj.a + v1 * v2;
      },
    };
    evaluate('obj.b(1+2,3)', { obj });
    expect(obj.a).toBe(10);
  });

  it('this reference', () => {
    const obj = {
      a: 1,
      b(v: number) {
        this.a = v;
      },
    };
    evaluate('obj.b(5)', { obj });
    expect(obj.a).toBe(5);
  });
});
