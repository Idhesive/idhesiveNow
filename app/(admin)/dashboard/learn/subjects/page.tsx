
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function BrowseSubjectsPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        return redirect("/sign-in")
    }

    const subjects = await prisma.subject.findMany({
        include: {
            curriculum: true,
            gradeLevels: {
                orderBy: { grade: "asc" },
            },
        },
        orderBy: {
            name: "asc",
        },
    })

    return (
        <div className="container py-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/learn">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Browse Subjects</h1>
                    <p className="text-muted-foreground">Select a subject and grade level to explore.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject) => (
                    <div key={subject.id} className="flex flex-col p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-muted-foreground">{subject.curriculum.code}</span>
                            {subject.icon && <span className="text-2xl">{subject.icon}</span>}
                        </div>
                        <h2 className="text-xl font-semibold mb-2">{subject.name}</h2>
                        <p className="text-muted-foreground line-clamp-2 mb-4 flex-grow text-sm">{subject.description}</p>

                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Available Grades:</h3>
                            <div className="flex flex-wrap gap-2">
                                {subject.gradeLevels.length > 0 ? (
                                    subject.gradeLevels.map(grade => (
                                        <Link
                                            key={grade.id}
                                            href={`/dashboard/learn/${subject.id}?grade=${grade.grade}`}
                                            className="inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1"
                                        >
                                            {grade.name}
                                        </Link>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground italic">No grades available</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
