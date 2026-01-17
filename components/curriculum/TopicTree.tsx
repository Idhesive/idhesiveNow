
"use client";

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface TopicNode {
    id: string;
    name: string;
    type: 'TOPIC' | 'SUBTOPIC';
    children?: TopicNode[];
    href?: string; // Optional link
}

interface TopicTreeProps {
    data: TopicNode[];
    className?: string;
    defaultExpanded?: boolean;
}

const TreeNode = ({ node, depth, defaultExpanded }: { node: TopicNode; depth: number; defaultExpanded: boolean }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div>
            <div
                className={cn(
                    "flex items-center py-1 px-2 rounded-md hover:bg-muted/50 transition-colors select-none",
                    depth > 0 && "ml-4"
                )}
            >
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mr-1 p-0.5 rounded hover:bg-muted text-muted-foreground"
                    disabled={!hasChildren}
                >
                    {hasChildren ? (
                        isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                    ) : (
                        <span className="w-4 h-4 block" />
                    )}
                </button>

                <span className="mr-2 text-primary">
                    {node.type === 'TOPIC' ? <Folder className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                </span>

                {node.href ? (
                    <Link href={node.href} className="flex-1 hover:underline text-sm font-medium">
                        {node.name}
                    </Link>
                ) : (
                    <span className="flex-1 text-sm font-medium">{node.name}</span>
                )}
            </div>

            {isExpanded && hasChildren && (
                <div className="border-l ml-[19px] pl-1">
                    {node.children!.map(child => (
                        <TreeNode key={child.id} node={child} depth={depth + 1} defaultExpanded={defaultExpanded} />
                    ))}
                </div>
            )}
        </div>
    );
};

export function TopicTree({ data, className, defaultExpanded = false }: TopicTreeProps) {
    return (
        <div className={cn("space-y-1", className)}>
            {data.map(node => (
                <TreeNode key={node.id} node={node} depth={0} defaultExpanded={defaultExpanded} />
            ))}
            {data.length === 0 && (
                <div className="text-sm text-muted-foreground italic px-2">No topics available</div>
            )}
        </div>
    );
}
