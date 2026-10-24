import Link from 'next/link'
import { AppShell, PageFooter } from '@/components/site-shell'

export default function NotFound() {
    return (
        <AppShell>
            <article className="reading-page">
                <h1>That page doesn&apos;t exist.</h1>
                <div className="external-links">
                    <Link href="/">Home</Link>
                    <Link href="/projects">Projects</Link>
                </div>
            </article>
            <PageFooter />
        </AppShell>
    )
}

