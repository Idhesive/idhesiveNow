
"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps<T> {
    data: T[];
    columns: {
        header: string;
        accessor: keyof T | ((item: T) => React.ReactNode);
        className?: string;
    }[];
    keyExtractor: (item: T) => string;
    onRowClick?: (item: T) => void;
    isLoading?: boolean;
}

export function DataTable<T>({
    data,
    columns,
    keyExtractor,
    onRowClick,
    isLoading
}: DataTableProps<T>) {

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading data...</div>;
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((col, i) => (
                            <TableHead key={i} className={col.className}>
                                {col.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length > 0 ? (
                        data.map((item) => (
                            <TableRow
                                key={keyExtractor(item)}
                                onClick={() => onRowClick?.(item)}
                                className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                            >
                                {columns.map((col, i) => (
                                    <TableCell key={i} className={col.className}>
                                        {typeof col.accessor === 'function'
                                            ? col.accessor(item)
                                            : (item[col.accessor] as React.ReactNode)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Simple pagination placeholder */}
            {/* 
      <div className="flex items-center justify-end space-x-2 py-4 px-4 border-t">
        <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" disabled>
            <ChevronRight className="h-4 w-4" />
        </Button>
      </div> 
      */}
        </div>
    );
}
