export const siteConfig = {
  name: 'Odeh Samuel', role: 'Full-stack developer', email: 'hello@example.com',
  github: 'https://github.com/SAMPLE', linkedin: 'https://www.linkedin.com/in/SAMPLE', resumePath: '/resume.pdf',
  placeholderFields: ['email','github','linkedin','resumePath'],
  availability: 'Open to freelance projects and junior full-stack roles.', filterThreshold: 8,
  nav: [{label:'Projects',href:'/projects'},{label:'About',href:'/about'},{label:'Contact',href:'/contact'},{label:'Résumé',href:'/resume'}],
  howIWork: [],
  toolkit: { interface:['React','Next.js','JavaScript','HTML/CSS','Tailwind CSS','Framer Motion'], server:['Node.js','Express.js','REST APIs','Authentication (JWT, sessions)','Cloudinary/Multer'], data:{relational:['PostgreSQL','MySQL','SQL','Database design'],document:['MongoDB']} }
}
export const contextLabels = { personal:'Personal project', learning:'Learning project', academic:'Academic project', freelance:'Freelance project', client:'Client project', team:'Team project', prototype:'Prototype' }
export const statusLabels = { live:'Live', 'in-progress':'In progress', prototype:'Prototype', archived:'Archived' }
export const sample = (project, field) => project.placeholderFields?.includes(field)
