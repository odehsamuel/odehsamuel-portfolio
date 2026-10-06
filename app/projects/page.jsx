import { siteConfig } from '@/content/site-config'
import { getPublishedProjects } from '@/lib/content/projects'
import { PageShell, SectionHeader, ProjectIndex } from '@/components/portfolio'
export const metadata={title:'Projects — Odeh Samuel',description:'An index of Odeh Samuel’s full-stack projects.'}
export default function Projects(){return <PageShell active="/projects"><main id="content" className="container page"><SectionHeader number="01" title="Projects"/><p className="page-intro">A working index of full-stack applications, booking flows and data-backed interfaces.</p><ProjectIndex projects={getPublishedProjects()}/><p className="mono note">{getPublishedProjects().length} published projects · filters appear when the index grows</p></main></PageShell>}
