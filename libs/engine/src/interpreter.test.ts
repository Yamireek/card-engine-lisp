 import { describe, expect, it } from 'vitest'; // <-- **
import { LispInterpreter } from './engine';
 import { toFunction, toLisp } from './parser2';

function evaluate(code: string, env = {}) {
    const interpreter = new LispInterpreter(toLisp(code), env);
    const interpreted = interpreter.run();
    const evaluated = toFunction(code, env);
    if (typeof interpreted === 'function' && typeof evaluated === 'function') {
      expect(interpreted.toString()).toBe(evaluated.toString());
    } else {
      expect(interpreted).toStrictEqual(evaluated);
    }
    return interpreted;
}

describe('binary expressions', () => {
  it('numbers +', () => {
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
});
