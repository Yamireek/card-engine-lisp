export type FunctionValue = {
  type: 'FUNCTION';
  name: string;
  parameters: string[];
  body: Instruction[];
};

export type InstructionsValue = {
  type: 'INSTRUCTIONS';
  body: Instruction[];
};

export type ArrayValue = {
  type: 'ARRAY';
  items: Value[];
};

export type Value =
  | number
  | boolean
  | string
  | FunctionValue
  | InstructionsValue;

export type BinaryOperator = '+' | '*' | '/' | '-' | '==' | '<=';

export type AssignmentOperator = '=';

export type Instruction =
  | BinaryOperator
  | 'IF'
  | '?'
  | 'RETURN'
  | 'CALL'
  | ['PUSH', Value]
  | ['LOAD', string]
  | ['SAVE', string];

export type Env = Record<string, any>;
