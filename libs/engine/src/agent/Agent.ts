export type ChooseItemsParams<T> = {
  label: string;
  items: T[];
  min?: number;
  max?: number;
};

export abstract class Agent {
  abstract chooseItems<T>(params: ChooseItemsParams<T>): T[];
}
