
import prisma from '@/lib/prisma';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Calendar, Trophy } from 'lucide-react';

export default async function ChallengesPage() {
    const today = new Date();

    // Placeholder: Get today's challenge
    const dailyChallenge = await prisma.dailyChallenge.findFirst({
        where: {
            challengeDate: {
                gte: new Date(today.setHours(0, 0, 0, 0)),
                lt: new Date(today.setHours(23, 59, 59, 999))
            }
        },
        include: {
            // template: true // If relation exists
        }
    });

    return (
        <div className="container py-8 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Zap className="text-yellow-500 fill-yellow-500" />
                        Daily Challenges
                    </h1>
                    <p className="text-muted-foreground mt-2">Compete with others and earn extra XP.</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold">12,450 XP</div>
                    <div className="text-sm text-muted-foreground">Your Score Balance</div>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {/* Main Challenge Card */}
                <Card className="md:col-span-2 border-primary/50 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 bg-primary text-primary-foreground rounded-bl-xl font-bold">
                        TODAY
                    </div>
                    <CardHeader>
                        <CardTitle className="text-2xl">Daily Math Sprint</CardTitle>
                        <CardDescription>Solve 20 algebra problems as fast as you can.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 mb-6">
                            <div className="flex items-center gap-2">
                                <Trophy className="h-4 w-4 text-yellow-500" />
                                <span className="font-semibold text-yellow-500">500 XP Reward</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Ends in 12h 30m</span>
                            </div>
                        </div>
                        <Button size="lg" className="w-full md:w-auto">Start Challenge</Button>
                    </CardContent>
                </Card>

                {/* Leaderboard Teaser */}
                <Card>
                    <CardHeader>
                        <CardTitle>Leaderboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((pos) => (
                                <div key={pos} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={`font-bold w-6 text-center ${pos <= 3 ? 'text-primary' : 'text-muted-foreground'}`}>{pos}</span>
                                        <div className="h-8 w-8 rounded-full bg-secondary" />
                                        <span className="text-sm font-medium">User {pos}</span>
                                    </div>
                                    <span className="text-xs font-mono">{1000 - pos * 50} pts</span>
                                </div>
                            ))}
                        </div>
                        <Button variant="link" className="w-full mt-4">View Full Rankings</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
