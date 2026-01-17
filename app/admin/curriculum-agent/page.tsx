'use client';

import { useEffect, useState } from 'react';
import { CurriculumDocument, DocumentProcessingStep } from '@prisma/client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Play, Clock, CheckCircle2, XCircle, Loader2, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CurriculumAgentPage() {
    const [documents, setDocuments] = useState<(CurriculumDocument & { steps: DocumentProcessingStep[] })[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDocuments = async () => {
        try {
            const res = await fetch('/api/admin/curriculum-agent/list');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setDocuments(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load documents');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
        const interval = setInterval(fetchDocuments, 5000); // Polling for status updates
        return () => clearInterval(interval);
    }, []);

    const handleAction = async (docId: string, action: 'rerun' | 'reset') => {
        try {
            const res = await fetch(`/api/admin/curriculum-agent/${docId}/${action}`, { method: 'POST' });
            if (!res.ok) throw new Error(`${action} failed`);
            toast.success(`Pipeline ${action === 'rerun' ? 'restarted' : 'reset'}`);
            fetchDocuments();
        } catch (error) {
            toast.error(`Action failed: ${action}`);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>;
            case 'FAILED':
                return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
            case 'PROCESSING':
                return <Badge variant="secondary" className="bg-blue-500 text-white animate-pulse"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Processing</Badge>;
            default:
                return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
        }
    };

    const getStepIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'FAILED': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'IN_PROGRESS': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
            default: return <Clock className="w-4 h-4 text-muted-foreground" />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Curriculum Agent</h1>
                    <p className="text-muted-foreground">Manage CAPS curriculum processing pipelines (Apache Age & RAG)</p>
                </div>
                <Link href="/admin/curriculum-agent/upload">
                    <Button>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6">
                {documents.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Upload className="w-12 h-12 mb-4 opacity-20" />
                            <p>No documents uploaded yet.</p>
                            <Link href="/admin/curriculum-agent/upload" className="mt-4">
                                <Button variant="outline">Get Started</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    documents.map((doc: CurriculumDocument & { steps: DocumentProcessingStep[] }) => (
                        <Card key={doc.id} className="overflow-hidden">
                            <CardHeader className="bg-muted/50 py-4 px-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-lg">{doc.filename}</CardTitle>
                                        <CardDescription>{(doc.size / 1024 / 1024).toFixed(2)} MB • {new Date(doc.createdAt).toLocaleString()}</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(doc.status)}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAction(doc.id, 'rerun')}
                                            disabled={doc.status === 'PROCESSING'}
                                        >
                                            <Play className="w-3 h-3 mr-1" /> Rerun
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-muted-foreground hover:text-destructive"
                                            onClick={() => handleAction(doc.id, 'reset')}
                                            disabled={doc.status === 'PROCESSING'}
                                        >
                                            <RotateCcw className="w-3 h-3 mr-1" /> Reset
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-5 gap-4 opacity-75">
                                    {['PARSE', 'SPLIT', 'DB_SYNC', 'GRAPH_SYNC', 'RAG_SYNC'].map((stepName) => {
                                        const step = doc.steps.find((s: DocumentProcessingStep) => s.step === stepName);
                                        return (
                                            <div key={stepName} className="flex flex-col items-center text-center space-y-2 group relative">
                                                <div className="p-3 bg-muted rounded-full transition-colors group-hover:bg-muted/80">
                                                    {getStepIcon(step?.status || 'PENDING')}
                                                </div>
                                                <span className="text-xs font-semibold">{stepName}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase">{step?.status || 'PENDING'}</span>
                                                {step?.logs && (
                                                    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-48 p-2 bg-destructive text-destructive-foreground text-[10px] rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                                        {step.logs}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
