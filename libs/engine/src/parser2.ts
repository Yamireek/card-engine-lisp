import { parse, parseScript } from 'meriyah';
import { get, isArray, max, set } from 'lodash';
import {
  Expression,
  MemberExpression,
  Parameter,
  PrivateIdentifier,
  Program,
  Statement,
  VariableDeclarator,
} from 'meriyah/dist/src/estree';

interface Flavoring<FlavorT> {
  _type?: FlavorT;
}

type Flavor<T, FlavorT> = T & Flavoring<FlavorT>;

type CardId = Flavor<number, 'cardId'>;

type PlayerId = Flavor<'1' | '2' | '3' | '4', 'playerId'>;

type Token = 'damage' | 'resource' | 'progress';

type Tokens = Record<Token, number>;

class Card {
  id: CardId;
  name: string;
  att: number;
  def: number;
  tokens: Tokens;

  public methodOverrides1: Record<string, SExpr[]> = {};

  public methodOverrides2: Record<string, MethodModifier2<Card, any>[]> = {};

  constructor(
    public game: Game,
    props: { name: string; att: number; def: number }
  ) {
    this.id = game.nextId++;
    this.name = props.name;
    this.att = props.att;
    this.def = props.def;
    this.tokens = { damage: 0, progress: 0, resource: 0 };

    if (!game.simulation) {
      this.heal = Overrideable(this.heal, {
        name: 'heal',
      } as any);
    }
  }

  addOverride(methodName: string, override: (...args: any[]) => any): void {
    if (!this.methodOverrides1[methodName]) {
      this.methodOverrides1[methodName] = [];
    }

    const lisp = toLisp(parse(override.toString()));
    this.methodOverrides1[methodName].push(lisp);
  }

  addOVerride2<M extends MethodNames<Card>>(
    methodName: M,
    modifier: MethodModifier2<Card, M>
  ) {
    if (!this.methodOverrides2[methodName]) {
      this.methodOverrides2[methodName] = [];
    }

    const lisp = toLisp(parse(modifier.toString()));
    console.log(JSON.stringify(lisp));
    //this.methodOverrides2[methodName].push(lisp);

    this.methodOverrides2[methodName].push(modifier);
  }

  removeOverrides(methodName: string): void {
    const overrides = this.methodOverrides2[methodName];
    if (overrides) {
      this.methodOverrides1[methodName] = [];
      this.methodOverrides2[methodName] = [];
    }
  }

  heal(amount: number) {
    console.log('heal:' + amount);
    this.tokens.damage -= amount;
  }

  dealDamage(amount: number) {
    this.tokens.damage += amount;
  }
}

function test(this: Card, ...args: any[]) {
  console.log(args);
}

function Overrideable<TThis extends Card, TArgs extends any[]>(
  original: Function,
  context: ClassMethodDecoratorContext<
    TThis,
    (this: TThis, ...args: TArgs) => void
  >
) {
  const methodName = context.name.toString();

  function overriden1(this: TThis, ...args: TArgs) {
    const overrides = this.methodOverrides1?.[methodName] || [];
    if (overrides.length === 0) {
      return original.call(this, ...args);
    } else {
      const newArgs = overrides.reduce((p, c) => {
        const f = toFunction(c);
        return f(p);
      }, args);

      const lastArg = args[args.length - 1];
      if (typeof lastArg === 'object' && 'interpreting' in lastArg) {
        return original as any;
      }
      return original.call(this, ...newArgs);
    }
  }

  function overriden(this: TThis, ...args: TArgs) {
    const overrides = this.methodOverrides2?.[methodName] || [];
    if (overrides.length === 0) {
      return original.call(this, ...args);
    } else {
      // const newMethod = overrides[0](original as any) as Function;

      const newMethod = overrides.reduce((p, c) => c(p as any), original);
      return newMethod.call(this, args);
    }
  }

  return overriden;
}

export function toFunction<F extends Function>(e: SExpr, env?: any): F {
  const code = `return ${toCode(e)}`;
  const vars = env ? Object.keys(env) : [];
  const f = new Function(...vars, code);
  const values = vars.map((v) => get(env, v));
  return f(...values);
}

type MethodNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

// Utility type to get method arguments
type MethodArgs<T, M extends MethodNames<T>> = T[M] extends (
  ...args: infer A
) => any
  ? A
  : never;

type MethodModifier<E, M extends MethodNames<E>> = (
  args: MethodArgs<E, M>,
  body: SExpr
) => [MethodArgs<E, M>, SExpr];

const x: MethodModifier<Card, 'heal'> = ([amount], body) => [
  [amount + 10],
  body,
];

type MethodModifier2<E, M extends MethodNames<E>> = (
  original: (args: MethodArgs<E, M>) => void
) => (args: MethodArgs<E, M>) => void;

const y: MethodModifier2<Card, 'heal'> =
  (original) =>
  ([amount]) =>
    original([amount + 10]);

class Game {
  public nextId = 1;
  public cards: Card[] = [];

  constructor(public readonly simulation: boolean, public agent: Agent) {}

  get card() {
    return this.cards[0];
  }

  addCard(props: { name: string; att: number; def: number }) {
    this.cards.push(new Card(this, props));
  }

  applyToCards<M extends MethodNames<Card>>(
    action: M,
    ...args: MethodArgs<Card, M>
  ): void {
    for (const card of this.cards) {
      const method = card[action] as any;
      method.apply(card, args);
    }
  }
}

function action<V>(f: (entity: V, agent: Agent) => void): Action<V> {
  return new Action(f);
}

type Atom = string | number | boolean;
export type SExpr = Atom | SExpr[];

class Action<E> {
  lisp: SExpr;

  constructor(private func: (entity: E, agent: Agent) => void) {
    this.lisp = toLisp(func);
  }

  invoke(entity: E, agent: Agent) {
    this.func(entity, agent);
  }
}

function memberToLisp(
  me: Expression | PrivateIdentifier,
  prefix?: string
): SExpr {
  switch (me.type) {
    case 'MemberExpression':
      if (prefix) {
        return ['get', memberToLisp(me.object) + '.' + toLisp(me.property)];
      } else {
        return memberToLisp(me.object) + '.' + memberToLisp(me.property);
      }
    case 'Identifier':
      return me.name;
    case 'ThisExpression':
      return 'this';
    case 'ArrowFunctionExpression':
      return ['lambda', me.params.map(toLisp), toLisp(me.body)];
    case 'CallExpression':
      return toLisp(me);
    default:
      console.log(me.type);
      return 'unknown_getter:' + me.type;
  }
}

function simpleMap<A, B>(items: A[], mapper: (item: A) => B): B | B[] {
  if (items.length === 1) {
    return mapper(items[0]);
  } else {
    return items.map(mapper);
  }
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
      return ['call', memberToLisp(value.callee), value.arguments.map(toLisp)];
    case 'MemberExpression':
      return memberToLisp(value, 'get');
    case 'AssignmentExpression':
      return [value.operator, memberToLisp(value.left), toLisp(value.right)];
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
      return ['lambda', simpleMap(value.params, toLisp), toLisp(value.body!)];
    case 'BlockStatement':
      if (value.body.length === 1) {
        return toLisp(value.body[0]);
      } else {
        return value.body.map(toLisp);
      }
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
      console.log(value.type);
      return 'unknown:' + value.type;
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
  }

  console.log('unknown expr' + JSON.stringify(expr));

  return 'errro';
}

function asArray<T>(items: T | T[]): T[] {
  if (isArray(items)) {
    return items;
  }

  return [items];
}

type Agent = {
  chooseNumber(min: number, max: number): number;
};

// const program: Action<Game> = action((g, a) => {
//   while (g.nextId < 10) {
//     g.nextId += a.chooseNumber(1, 3);
//     g.card.heal(1);
//   }
// });

export const randomAgent: Agent = {
  chooseNumber(min, max) {
    //const choosen = Math.random() * (max - min) + min;
    const choosen = (min + max) / 2;
    console.log(`choosen: ${choosen}`);
    return choosen;
  },
};

// const gameS = new Game(false, randomAgent);
// gameS.addCard({
//   name: "TEST-1",
//   att: 1,
//   def: 1,
// });
// gameS.addCard({
//   name: "TEST-1",
//   att: 1,
//   def: 1,
// });

// const gameI = new Game(true, randomAgent);
// gameI.addCard({
//   name: "TEST-1",
//   att: 1,
//   def: 1,
// });
// gameI.addCard({
//   name: "TEST-1",
//   att: 1,
//   def: 1,
// });

// gameI.card.addOVerride2("heal", (heal) => {
//   return function mod(this: Card, [amount]) {
//     return heal.call(this, [amount + 10]);
//   };
// });

// console.time();
// program.invoke(gameS, randomAgent);
// console.timeEnd();
// console.log(gameS.card.tokens.damage);

// gameI.card.addOVerride2(
//   "heal",
//   (heal) =>
//     ([amount]) =>
//       heal([amount + 10])
// );

// const i = new Interpreter(program.lisp, gameI, randomAgent);
// console.time();
// while (i.step()) {}
// console.timeEnd();
// console.log(gameS.card.tokens.damage);

// game.card.addOVerride2("heal", (heal) => {
//   return function (this: Card, [amount]) {
//     return heal.call(this, [amount + 100]);
//   };
// });

// game.applyToCards("heal", 1);

// class Test {
//   value = 5;

//   getValue(add: number) {
//     return this.value + add;
//   }
// }

// const i = new Test();
// console.log(i.getValue(1));

// const overide1 = (original: Function) =>
//   function (this: any, add: any) {
//     return original.apply(this, [add + 1]);
//   };

// const overide2 = (original: Function) => (add: any) => original([add + 1]);

// (i.getValue as any) = overide1(i.getValue);

// console.log(i.getValue(1));

// const method = ["lambda", ["amount"], ["-=", "this.tokens.damage", "amount"]];

// const args = [1];

// const modifier = [
//   "lambda",
//   ["heal"],
//   [
//     "lambda",
//     [["array", "amount"]],
//     ["call", "heal", [["array", ["+", "amount", 10]]]],
//   ],
// ];

// const updated = ["invoke", modifier, method];

// const heal = ["invoke", updated, args];
