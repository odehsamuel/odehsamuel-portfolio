import { siteConfig } from '@/content/site-config'
import { getFeaturedProjects } from '@/lib/content/projects'
import { AppShell, PageFooter } from '@/components/site-shell'
import { Intro, SectionHeader, FeaturedProject, WhatIBuild, Toolkit, AboutPreview, GetInTouch } from '@/components/home-sections'
export default function Page(){const projects=getFeaturedProjects();return <AppShell><Intro/><section id="selected-projects"><SectionHeader number="02" title={siteConfig.labels.selected} link={{href:'/projects',label:siteConfig.labels.viewAll}}/><div>{projects.map((p,i)=><FeaturedProject key={p.slug} project={p} index={i}/>)}</div></section><WhatIBuild/><Toolkit/><AboutPreview/><GetInTouch/><PageFooter/></AppShell>}
