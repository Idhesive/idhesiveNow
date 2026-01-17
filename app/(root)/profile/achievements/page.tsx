
import prisma from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function AchievementsPage() {
    const achievements = await prisma.achievementDefinition.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
    });

    return (
        <div className="container py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-2">Achievements</h1>
            <p className="text-muted-foreground mb-8">Track your progress and earn rewards.</p>

            <div className="grid gap-4">
                {achievements.length > 0 ? (
                    achievements.map(ach => (
                        <Card key={ach.id} className="bg-card">
                            <CardContent className="flex items-center p-6 gap-4">
                                <div className="h-16 w-16 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0">
                                    {/* Icon placeholder */}
                                    <span className="text-2xl">🏆</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">{ach.name}</h3>
                                    <p className="text-muted-foreground">{ach.description}</p>
                                    <div className="flex gap-2 mt-2">
                                        <Badge variant="secondary">{ach.difficulty}</Badge>
                                        <Badge variant="outline">+{ach.xpReward} XP</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p className="text-muted-foreground">No achievements defined yet.</p>
                )}
            </div>
        </div>
    );
}
