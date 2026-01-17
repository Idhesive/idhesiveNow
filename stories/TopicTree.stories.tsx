
import type { Meta, StoryObj } from '@storybook/react';
import { TopicTree } from '@/components/curriculum/TopicTree';

const meta: Meta<typeof TopicTree> = {
    title: 'Curriculum/TopicTree',
    component: TopicTree,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TopicTree>;

const sampleData = [
    {
        id: '1',
        name: 'Mathematics',
        type: 'TOPIC' as const,
        children: [
            { id: '1-1', name: 'Algebra', type: 'SUBTOPIC' as const },
            { id: '1-2', name: 'Geometry', type: 'SUBTOPIC' as const },
        ]
    },
    {
        id: '2',
        name: 'Science',
        type: 'TOPIC' as const,
        children: [
            {
                id: '2-1',
                name: 'Physics',
                type: 'TOPIC' as const,
                children: [
                    { id: '2-1-1', name: 'Motion', type: 'SUBTOPIC' as const }
                ]
            }
        ]
    }
];

export const Default: Story = {
    args: {
        data: sampleData,
    },
};

export const ExpandedByDefault: Story = {
    args: {
        data: sampleData,
        defaultExpanded: true
    },
};

export const Empty: Story = {
    args: {
        data: [],
    },
};
