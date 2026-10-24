import { AppShell, PageFooter, ExternalLinks } from '@/components/site-shell'
import { siteConfig } from '@/content/site-config'

export default function ContactPage() {
    return (
        <AppShell>
            <article className="reading-page">
                <div className="section-header">
                    <span className="mono section-number">01</span>
                    <h1>Contact</h1>
                </div>
                <p>Have a project in mind? Email me.</p>
                <a className="contact-email" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
                <ExternalLinks />
            </article>
            <PageFooter />
        </AppShell>
    )
}
