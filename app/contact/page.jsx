import { PageShell, SectionHeader } from '@/components/portfolio'
import { siteConfig } from '@/content/site-config'
export const metadata={title:'Contact — Odeh Samuel',description:'Get in touch with Odeh Samuel.'}
export default function Contact(){return <PageShell active="/contact"><main id="content" className="container page prose-page"><SectionHeader number="01" title="Contact"/><p className="page-intro">If you have a project in mind, I&apos;d be glad to hear about it.</p><a className="email-large" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a><div className="contact-list"><a href={siteConfig.github}>GitHub</a><a href={siteConfig.linkedin}>LinkedIn</a><a href={siteConfig.resumePath}>Résumé</a></div></main></PageShell>}
