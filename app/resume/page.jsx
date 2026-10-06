import { Download } from 'lucide-react'
import { PageShell, SectionHeader } from '@/components/portfolio'
import { siteConfig } from '@/content/site-config'
export const metadata={title:'Résumé — Odeh Samuel',description:'Résumé of Odeh Samuel.'}
export default function Resume(){return <PageShell active="/resume"><main id="content" className="container page prose-page"><SectionHeader number="01" title="Résumé"/><p className="page-intro">A concise record of my work and technical experience.</p><a className="button-primary" href={siteConfig.resumePath}>Download résumé (PDF) <Download aria-hidden="true"/></a><p className="mono note">Résumé PDF placeholder for the prototype.</p></main></PageShell>}
