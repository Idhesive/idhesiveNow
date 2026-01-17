
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, File, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function UploadDocumentPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/admin/curriculum-agent/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            toast.success('Document uploaded successfully');
            router.push('/admin/curriculum-agent');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload document');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Upload Curriculum PDF</CardTitle>
                    <CardDescription>
                        Upload a CAPS curriculum document to start the processing pipeline.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!file ? (
                        <div
                            className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary/50 cursor-pointer transition-colors"
                            onClick={() => document.getElementById('file-upload')?.click()}
                        >
                            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                            <p className="text-sm text-muted-foreground">Click to select or drag and drop</p>
                            <p className="text-xs text-muted-foreground mt-2">CAPS PDFs preferred</p>
                            <Input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                accept="application/pdf"
                                onChange={handleFileChange}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg border">
                            <div className="flex items-center gap-3">
                                <File className="w-8 h-8 text-primary" />
                                <div>
                                    <p className="text-sm font-medium truncate max-w-[300px]">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setFile(null)} disabled={isUploading}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-end gap-3 border-t pt-6">
                    <Button variant="outline" onClick={() => router.back()} disabled={isUploading}>Cancel</Button>
                    <Button onClick={handleUpload} disabled={!file || isUploading}>
                        {isUploading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            'Start Pipeline'
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
