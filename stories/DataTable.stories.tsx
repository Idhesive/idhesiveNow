
import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from '@/components/admin/data-table';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof DataTable> = {
    title: 'Admin/DataTable',
    component: DataTable,
    tags: ['autodocs'],
    args: {
        columns: [
            { header: 'ID', accessor: 'id' as const },
            { header: 'Name', accessor: 'name' as const },
            { header: 'Status', accessor: (item: any) => item.active ? 'Active' : 'Inactive' },
            { header: 'Actions', accessor: () => <Button size="sm">Edit</Button> }
        ],
        keyExtractor: (item: any) => item.id
    }
};

export default meta;
type Story = StoryObj<typeof DataTable>;

const sampleData = [
    { id: '1', name: 'Item One', active: true },
    { id: '2', name: 'Item Two', active: false },
    { id: '3', name: 'Item Three', active: true },
];

export const Default: Story = {
    args: {
        data: sampleData,
    },
};

export const Empty: Story = {
    args: {
        data: [],
    },
};

export const Loading: Story = {
    args: {
        data: [],
        isLoading: true
    },
};
