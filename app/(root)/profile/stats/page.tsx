
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function StatsPage() {
    return (
        <div className="container py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Detailed Statistics</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Learning Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground border border-dashed rounded">
                            Chart Placeholder
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Topic Mastery</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground border border-dashed rounded">
                            Chart Placeholder
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
