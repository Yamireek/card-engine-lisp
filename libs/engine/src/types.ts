interface Flavoring<FlavorT> {
  _type?: FlavorT;
}

export type Flavor<T, FlavorT> = T & Flavoring<FlavorT>;

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

export type ReferenceValue = {
  type: 'REFERENCE';
  entity: string;
  id: number;
};

export type ChoiceValue = {
  type: 'CHOICE';
  title: string;
  options: Array<{ label: string; value: Value }>;
  min: number;
  max: number;
};

export type Value =
  | number
  | boolean
  | string
  | undefined
  | FunctionValue
  | InstructionsValue
  | ArrayValue
  | ReferenceValue
  | ChoiceValue;

export type BinaryOperator = '+' | '*' | '/' | '-' | '==' | '===' | '<=' | '<';

export type AssignmentOperator = '=';

export type Instruction =
  | BinaryOperator // 2 args from stack
  | 'IF' // 3 args
  | '?' // 3 args
  | 'RETURN'
  | 'CALL' // x args
  | ['CALL', string, string, number]
  | ['CALL', string, number]
  | ['PUSH', Value]
  | ['LOAD', string]
  | ['SAVE', string]
  | ['ARRAY', number]
  | ['ITERATE', string]; // 2 args, array + function

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Env = Record<string, any>;
