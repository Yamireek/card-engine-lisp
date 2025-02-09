import { Card } from '../entity';
import { EntityAction, Ability, Action } from '../state';

export type ActionAbility = {
  description: string;
  limit?: [number, 'round'];
  payment: EntityAction<Card>;
  effect: (self: Card) => EntityAction<Card>;
};

export function action(params: ActionAbility): Ability {
  const keyLimit = Math.random().toString();

  const limitAction: Action[] = params.limit
    ? [
        ['SPEND_LIMIT', { name: keyLimit, usages: 1, max: params.limit[0] }],
        ['SET_TRIGGER', 'end_of_round', ['RESET_LIMIT', keyLimit]],
      ]
    : [];

  return {
    description: params.description,
    code: (self) => ({
      type: 'card' as const,
      target: self.id,
      modifier: () => (p) => {
        p.actions.push({
          desc: params.description,
          action: (target) => [
            'SEQ',
            ...limitAction,
            params.payment,
            params.effect(target),
          ],
        });
      },
    }),
  };
}
