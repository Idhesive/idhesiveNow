
import prisma from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
// Note: In a real app, we'd use a Client Component for the form interactivity

export default async function PracticeSetupPage() {
    const subjects = await prisma.subject.findMany({
        include: {
            gradeLevels: {
                include: {
                    topics: {
                        where: { parentId: null }
                    }
                }
            }
        }
    });

    return (
        <div className="container py-8 max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Configure Practice Session</h1>

            <form action="/api/practice/start" method="POST" className="space-y-8">
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold border-b pb-2">1. Select Content</h2>
                    {/* This would be a complex Client Component selector tree */}
                    <div className="p-4 border rounded-md bg-muted/20">
                        <p className="text-sm text-muted-foreground italic">Topic selector component placeholder</p>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-lg font-semibold border-b pb-2">2. Settings</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="questionCount">Number of Questions</Label>
                            <Input type="number" id="questionCount" name="questionCount" defaultValue={10} min={5} max={50} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="difficulty">Difficulty</Label>
                            <select id="difficulty" name="difficulty" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <option value="ADAPTIVE">Adaptive (Recommended)</option>
                                <option value="FOUNDATIONAL">Foundational</option>
                                <option value="PROFICIENT">Proficient</option>
                                <option value="ADVANCED">Advanced</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox id="timeLimit" />
                        <Label htmlFor="timeLimit">Enable Timer</Label>
                    </div>
                </section>

                <div className="pt-4">
                    <Button size="lg" className="w-full">Start Practice</Button>
                </div>
            </form>
        </div>
    );
}
