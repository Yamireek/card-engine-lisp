export type Value = number | boolean | FunctionValue | Instruction[];

export type BinaryOperator = '+' | '*' | '/' | '-' | '==' | '<=';

export type AssignmentOperator = '=';

export type FunctionValue = ['FUNCTION', string, string[], Instruction[]];

export type Instruction =
  | BinaryOperator
  | 'IF'
  | ['PUSH', Value]
  | ['LOAD', string]
  | ['SAVE', string]
  | ['CAPTURE', string]
  | ['RETURN']
  | ['CALL', string?];

export type Env = Record<string, any>;
