import { AppShell, PageFooter } from '@/components/site-shell'
import { ProjectIndex, FilterBar } from '@/components/project-pages'
import { getPublishedProjects, getFilterOptions } from '@/lib/content/projects'
import { siteConfig } from '@/content/site-config'

export default async function ProjectsPage({ searchParams }) {
    const params = await searchParams

    let projects = getPublishedProjects()

    if (params?.tech) {
        projects = projects.filter(p =>
            [...(p.stack.frontend || []), ...(p.stack.backend || []), ...(p.stack.databases || []).map(d => d.name), ...(p.stack.other || [])].some(t => t.toLowerCase() === params.tech.toLowerCase())
        )
    }

    if (params?.category) {
        projects = projects.filter(p => p.category === params.category)
    }

    return (
        <AppShell>
            <ProjectIndex projects={projects} />
            <FilterBar options={getFilterOptions()} />
            <PageFooter />
        </AppShell>
    )
}
