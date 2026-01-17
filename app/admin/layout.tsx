
import AppSidebar from '@/components/app-sidebar'; // Reuse or create admin specific
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b px-6 py-4 flex items-center justify-between bg-card">
                <div className="font-bold text-xl">Admin Console</div>
                <nav className="flex gap-4 text-sm font-medium">
                    <Link href="/admin" className="hover:text-primary">Dashboard</Link>
                    <Link href="/admin/curriculum" className="hover:text-primary">Curriculum</Link>
                    <Link href="/admin/questions" className="hover:text-primary">Questions</Link>
                    <Link href="/admin/assessments" className="hover:text-primary">Assessments</Link>
                    <Link href="/admin/curriculum-agent" className="hover:text-primary underline underline-offset-4 decoration-primary">Agent</Link>
                    <Link href="/" className="text-muted-foreground hover:text-foreground ml-4">Exit</Link>
                </nav>
            </header>
            <main className="flex-1 p-6 bg-muted/10">
                {children}
            </main>
        </div>
    );
}
