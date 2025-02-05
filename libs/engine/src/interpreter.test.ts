import { describe, expect, it } from 'vitest';
import { toCode, toInstructions, valueToJs } from './utils';
import { Env } from './types';
import { Interpreter } from './interpreter';
import { observable } from 'mobx';

function evaluate(code: string, vars: Env = {}) {
  const instructions = toInstructions(code);
  console.log('code', code);
  console.log('instructions', instructions);
  console.log('decompiled', toCode(instructions));
  const interpreter = new Interpreter(instructions);
  interpreter.frames = [vars];
  const interpreted = interpreter.run();
  if (interpreted) {
    return valueToJs(interpreted);
  } else {
    return undefined;
  }
}

it('test', () => {
  expect(evaluate('const a = 1; const b = 2+a')).toBe(5);
});

describe('expressions', () => {
  it('numbers expression', () => {
    expect(evaluate('1+2')).toBe(3);
  });

  it('braces', () => {
    expect(evaluate('(1+2)*3+4')).toBe(13);
  });

  it('operand order', () => {
    expect(evaluate('10/2')).toBe(5);
    expect(evaluate('2/10')).toBe(0.2);
  });

  it('conditional', () => {
    expect(evaluate('true?1:2')).toBe(1);
    expect(evaluate('false?1:2')).toBe(2);
  });
});

describe('variables', () => {
  it('var in expression', () => {
    expect(evaluate('a+a', { a: 2 })).toBe(4);
  });

  it('var in array', () => {
    expect(evaluate('[a,a*2]', { a: 2 })).toStrictEqual([2, 4]);
  });

  it('var declaration', () => {
    const env = { b: 1 };
    evaluate('const a = 2 * 3; b = a * 4', env);
    expect(env.b).toBe(24);
  });
});

describe('conditions', () => {
  it('equals', () => {
    expect(evaluate('1==1')).toBe(true);
  });

  it('if true', () => {
    expect(
      evaluate('((v) => { if (v==1) { return 5 } else { return 10 } })(1)')
    ).toBe(5);
  });

  it('if false', () => {
    expect(
      evaluate('((v) => { if (v==1) { return 5 } else { return 10 } })(2)')
    ).toBe(10);
  });
});

describe('arrays', () => {
  it('simple array', () => {
    expect(evaluate('[1,2,3]')).toStrictEqual([1, 2, 3]);
  });

  it('expressions in array', () => {
    expect(evaluate('[1+2,3]')).toStrictEqual([3, 3]);
  });

  it('array on object filter', () => {
    expect(
      evaluate('a.filter(i => i < 3)', {
        a: [1, 2, 3],
      })
    ).toStrictEqual([1, 2]);
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
    expect(evaluate('((a) => (b) => a / b)(2+2)(2-1)')).toBe(4);
  });

  it('lambda as parameter', () => {
    expect(evaluate('(f => f())(() => 1)')).toBe(1);
  });

  it('single lambda with two parameters', () => {
    expect(evaluate('((a,b)=>a/b)(1+2+3,3)')).toBe(2);
  });

  it('recursive lambda', () => {
    expect(
      evaluate('(f => f(f))(f => n => n <= 1 ? 1 : n * f(f)(n - 1))(5)')
    ).toBe(120);
  });
});

describe('objects', () => {
  it('read property', () => {
    expect(evaluate('a.b.c', { a: { b: { c: 1 } } })).toBe(1);
  });

  it('write property', () => {
    const obj = observable({ a: { b: 1 } });
    evaluate('obj.a.b = 5 * 5', { obj });
    expect(obj.a.b).toBe(25);
  });

  it('property increment', () => {
    const env = { b: 1 };
    evaluate('b += 1', env);
    expect(env.b).toBe(2);
  });
});

describe('forof', () => {
  it('simple loop', () => {
    const obj = observable({ a: [1, 2, 3], b: 0 });
    evaluate('for(const i of obj.a) { obj.b = obj.b + i }', { obj });
    expect(obj.b).toBe(6);
  });
});
