import projects from '@/content/projects-data.json'
export const getAllProjects=()=>projects
export const getPublishedProjects=()=>projects.filter(p=>p.published).sort((a,b)=>a.order-b.order)
export const getFeaturedProjects=()=>getPublishedProjects().filter(p=>p.featured).sort((a,b)=>a.featuredOrder-b.featuredOrder)
export const getProjectBySlug=slug=>getPublishedProjects().find(p=>p.slug===slug)||null
export const getAdjacentProjects=slug=>{const all=getPublishedProjects();const i=all.findIndex(p=>p.slug===slug);return all[(i+1)%all.length]||null}
export const getFilterOptions=()=>{const all=getPublishedProjects();const counts=(values)=>Object.entries(values.flat().reduce((a,v)=>(a[v]=(a[v]||0)+1,a),{})).filter(([,n])=>n>=2).map(([value])=>value);return {categories:counts(all.map(p=>[p.category])),technologies:counts(all.map(p=>[...(p.stack.frontend||[]),...(p.stack.backend||[]),...(p.stack.databases||[]).map(d=>d.name),...(p.stack.other||[])]))}}
export const getTechUsage=()=>getPublishedProjects().reduce((map,p)=>{const tech=[...(p.stack.frontend||[]),...(p.stack.backend||[]),...(p.stack.databases||[]).map(d=>d.name),...(p.stack.other||[])];tech.forEach(t=>{map[t]=[...(map[t]||[]),p.slug]});return map},{})
