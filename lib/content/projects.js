import projects from '@/content/projects'
export const getPublishedProjects = () => projects.filter(p=>p.published).sort((a,b)=>a.order-b.order)
export const getFeaturedProjects = () => getPublishedProjects().filter(p=>p.featured).sort((a,b)=>a.featuredOrder-b.featuredOrder)
export const getProjectBySlug = slug => getPublishedProjects().find(p=>p.slug===slug) || null
export const getAdjacentProjects = slug => { const list=getPublishedProjects(); const i=list.findIndex(p=>p.slug===slug); return list[(i+1)%list.length] }
export const getFilterOptions = () => { const list=getPublishedProjects(); const categories=[...new Set(list.map(p=>p.category))].filter(c=>list.filter(p=>p.category===c).length>=2); const tech=[...new Set(list.flatMap(p=>[...(p.stack.frontend||[]),...(p.stack.backend||[]),...(p.stack.databases||[]).map(d=>d.name),...(p.stack.other||[])]))].filter(t=>list.filter(p=>JSON.stringify(p.stack).toLowerCase().includes(t.toLowerCase())).length>=2); return {categories,tech} }
export const getTechUsage = () => Object.entries(getPublishedProjects().flatMap(p=>[...(p.stack.frontend||[]),...(p.stack.backend||[]),...(p.stack.databases||[]).map(d=>d.name),...(p.stack.other||[])].map(t=>[t,p.slug])).reduce((a,[t,s])=>({...a,[t]:[...(a[t]||[]),s]}),{}))
