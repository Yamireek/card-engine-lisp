export type Atom = string | number | boolean;
export type SExpr = Atom | SExpr[];

export type Env = Record<string, any>;
