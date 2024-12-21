import { ComponentProps } from 'react';
import { ChooseOptionDialog } from './ChooseOptionDialog';
import type { Meta } from '@storybook/react';

const width = 430 / 2;
const height = 600 / 2;

const choices: ComponentProps<typeof ChooseOptionDialog>['choices'] = [
  {
    id: 1,
    title: 'Test choice 1',
    image: {
      src: 'https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/Aragorn.jpg',
      width,
      height,
    },
  },
  {
    id: 2,
    title: 'Test choice 2',
    image: {
      src: 'https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/Th%C3%A9odred.jpg',
      width,
      height,
    },
  },
  {
    id: 3,
    title: 'Test choice 3',
    image: {
      src: 'https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/Gl%C3%B3in.jpg',
      width,
      height,
    },
  },
];

const Story: Meta<typeof ChooseOptionDialog> = {
  component: ChooseOptionDialog,
  title: 'ChooseOptionDialog',
  args: {
    title: 'Test choice',
  },
  argTypes: {
    onSubmit: { action: 'onSubmit' },
  },
};
export default Story;

export const Text = {
  args: {
    choices: choices.map((c) => ({ ...c, image: undefined })),
  },
};

export const Images = {
  args: {
    choices,
  },
};

export const SingleChoice = {
  args: {
    choices,
    min: 1,
    max: 1,
  },
};

export const OptionalChoice = {
  args: {
    choices: [...choices, { id: 'skip', title: 'Skip' }],
    max: 1,
  },
};

export const ChoiceLimit = {
  args: {
    choices,
    min: 1,
    max: 2,
  },
};
