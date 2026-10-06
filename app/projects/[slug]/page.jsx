import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { getPublishedProjects, getProjectBySlug, getAdjacentProjects } from '@/lib/content/projects'
import { PageShell, ProjectImage, Meta, DetailSections } from '@/components/portfolio'
export function generateStaticParams(){return getPublishedProjects().map(p=>({slug:p.slug}))}
export async function generateMetadata({params}){const p=getProjectBySlug((await params).slug);return p?{title:p.seo?.title||`${p.title} — Odeh Samuel`,description:p.seo?.description||p.summary}: {title:'Project not found'}}
export default async function ProjectPage({params}){const p=getProjectBySlug((await params).slug);if(!p)notFound();const next=getAdjacentProjects(p.slug);return <PageShell active="/projects"><main id="content" className="container detail-page"><span className="mono accent">Project / {p.order}</span><h1>{p.title}</h1><p className="detail-summary">{p.summary}</p><Meta project={p}/><div className="detail-links">{p.links?.github&&<a href={p.links.github}>GitHub <ExternalLink aria-hidden="true"/></a>}{p.links?.live&&<a href={p.links.live}>Live demo <ExternalLink aria-hidden="true"/></a>}</div><ProjectImage project={p}/><DetailSections project={p}/><div className="project-next"><span className="mono">Next project</span><Link href={`/projects/${next.slug}`}>{next.title} <ArrowRight aria-hidden="true"/></Link></div><p className="detail-cta">Interested in something similar? <a href="mailto:hello@example.com">Email me.</a></p></main></PageShell>}
