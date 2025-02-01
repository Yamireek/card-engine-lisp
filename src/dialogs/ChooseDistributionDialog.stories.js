import { ChooseDistributionDialog } from './ChooseDistributionDialog';
const width = 430 / 2;
const height = 600 / 2;
const choices = [
    {
        id: 1,
        title: 'Test choice 1',
        min: 1,
        max: 2,
        image: {
            src: 'https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/Aragorn.jpg',
            width,
            height,
        },
    },
    {
        id: 2,
        title: 'Test choice 2',
        min: 1,
        max: 2,
        image: {
            src: 'https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/Th%C3%A9odred.jpg',
            width,
            height,
        },
    },
    {
        id: 3,
        title: 'Test choice 3',
        min: 1,
        max: 2,
        image: {
            src: 'https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/Gl%C3%B3in.jpg',
            width,
            height,
        },
    },
];
const Story = {
    component: ChooseDistributionDialog,
    title: 'ChooseDistributionDialog',
    args: {
        title: 'Test choice',
    },
    argTypes: {
        onSubmit: { action: 'onSubmit' },
    },
};
export default Story;
export const Images = {
    args: {
        choices,
        total: { min: 3, max: 4 },
        count: { min: 2, max: 2 },
    },
};
//# sourceMappingURL=ChooseDistributionDialog.stories.js.map