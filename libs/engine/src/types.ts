interface Flavoring<FlavorT> {
  _type?: FlavorT;
}

export type Flavor<T, FlavorT> = T & Flavoring<FlavorT>;

export type FunctionValue = {
  type: 'FUNCTION';
  name: string;
  native?: string;
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
  | InstructionsValue
  | ArrayValue;

export type BinaryOperator = '+' | '*' | '/' | '-' | '==' | '===' | '<=' | '<';

export type AssignmentOperator = '=';

export type Instruction =
  | BinaryOperator // 2 args from stack
  | 'IF' // 3 args
  | '?' // 3 args
  | 'RETURN'
  | 'CALL' // x args
  | ['CALL', string, string?]
  | ['PUSH', Value]
  | ['LOAD', string]
  | ['SAVE', string]
  | ['ARRAY', number]
  | ['ITERATE', string]; // 2 args, array + function

export type Env = Record<string, any>;
