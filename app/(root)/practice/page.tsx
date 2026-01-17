
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Assuming shadcn
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Settings, History } from 'lucide-react';

export default async function PracticePage() {
    // TODO: Get real user ID from auth session
    const userId = 'user-id-placeholder';

    // Fetch recent sessions
    const recentSessions = await prisma.assessmentSession.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        take: 5,
        include: {
            template: true
        }
    });

    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold mb-8">Practice Center</h1>

            <div className="grid gap-6 md:grid-cols-2 mb-12">
                <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Play className="h-5 w-5 fill-primary text-primary group-hover:scale-110 transition-transform" />
                            Quick Practice
                        </CardTitle>
                        <CardDescription>
                            Start a session based on your current learning path.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full">Start Now</Button>
                    </CardContent>
                </Card>

                <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-primary group-hover:rotate-45 transition-transform" />
                            Custom Session
                        </CardTitle>
                        <CardDescription>
                            Configure topics, difficulty, and question types.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/practice/setup">
                            <Button variant="outline" className="w-full">Configure</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            <section>
                <div className="flex items-center gap-2 mb-4">
                    <History className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">Recent Sessions</h2>
                </div>

                {recentSessions.length > 0 ? (
                    <div className="space-y-4">
                        {/* List sessions here */}
                        <div className="text-muted-foreground text-sm">Session list implementation pending user auth...</div>
                    </div>
                ) : (
                    <div className="text-center py-8 bg-muted/50 rounded-lg">
                        <p className="text-muted-foreground">No practice history found.</p>
                    </div>
                )}
            </section>
        </div>
    );
}
