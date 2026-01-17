
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Flame, Target, Settings, Award } from 'lucide-react';

export default async function ProfilePage() {
    // TODO: Auth
    const userId = 'user-placeholder-id';

    // Fetch user profile data
    // In a real scenario we'd query LearnerProfile, LearnerProgression, etc.
    const user = {
        name: 'Student Name',
        // ...
    };

    return (
        <div className="container py-8 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">My Profile</h1>
                <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Main Stats Card */}
                <Card className="md:col-span-1">
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                        <Avatar className="h-24 w-24 mb-4">
                            <AvatarImage src="" />
                            <AvatarFallback>SN</AvatarFallback>
                        </Avatar>
                        <h2 className="text-xl font-bold mb-1">Student Name</h2>
                        <p className="text-muted-foreground text-sm mb-4">Level 5 Learner</p>

                        <div className="w-full grid grid-cols-2 gap-4 mt-4 border-t pt-4">
                            <div>
                                <div className="font-bold text-2xl">1,250</div>
                                <div className="text-xs text-muted-foreground uppercase">XP</div>
                            </div>
                            <div>
                                <div className="font-bold text-2xl">12</div>
                                <div className="text-xs text-muted-foreground uppercase">Badges</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Activity & Streaks */}
                <div className="md:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardContent className="pt-6 flex items-center gap-4">
                                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                                    <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">5 Days</div>
                                    <div className="text-sm text-muted-foreground">Current Streak</div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6 flex items-center gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                                    <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">85%</div>
                                    <div className="text-sm text-muted-foreground">Avg. Accuracy</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Award className="h-5 w-5 mr-2 text-primary" />
                                Recent Achievements
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Placeholder achievements */}
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center">
                                        <Trophy className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="font-medium">Math Beginner</div>
                                        <div className="text-xs text-muted-foreground">Completed 5 math quizzes</div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <Link href="/profile/achievements">
                                    <Button variant="link" className="px-0">View All Achievements</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
