import { AppShell, PageFooter } from '@/components/site-shell'
import { siteConfig } from '@/content/site-config'
export default function ResumePage() { return <AppShell><article className="reading-page"><div className="section-header"><span className="mono section-number">01</span><h1>Résumé</h1></div><a className="button-primary" href={siteConfig.resumePath} download>Download résumé (PDF)</a><p className="text-muted">A résumé PDF will be available here.</p></article><PageFooter/></AppShell> }
