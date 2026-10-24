export const siteConfig = {
  name: 'Odeh Samuel', role: 'Full-stack developer', whatapp: 'https://wa.me/2348132370533', email: 'workwithodeh@gmail.com',
  github: 'https://github.com/odehsamuel', linkedin: 'https://www.linkedin.com/in/odeh-samuel-787b59265/', resumePath: '/resume.pdf',
  // Recommended image is 4:5 portrait, about 1200x1500px, under 300KB. Save in public/images/ (e.g. /images/portrait.jpg)
  heroImage: {
    src: '/images/portrait.jpeg',
    alt: 'Portrait of Odeh Samuel',
    caption: null,
  },
  placeholderFields: ['email', 'github', 'linkedin', 'resumePath'],
  availability: 'Open to freelance projects and intermediate full-stack roles.', filterThreshold: 8,
  nav: [{ label: 'Projects', href: '/projects' }, { label: 'About', href: '/about' }, { label: 'Contact', href: '/contact' }, { label: 'Résumé', href: '/resume' }],
  howIWork: [],
  toolkit: { interface: ['React', 'Next.js', 'JavaScript', 'HTML/CSS', 'Tailwind CSS', 'Framer Motion'], server: ['Node.js', 'Express.js', 'REST APIs', 'Authentication (JWT, sessions)', 'Cloudinary/Multer'], data: { relational: ['PostgreSQL', 'MySQL', 'SQL', 'Database design'], document: ['MongoDB'] } },
  labels: {
    introEyebrow: 'Full-stack developer', stack: 'React · Next.js · Node.js · Express · MongoDB · PostgreSQL', selected: 'Selected projects', whatIBuild: 'What I build', toolkit: 'Toolkit', about: 'About', contact: 'Get in touch', seeProjects: 'See my projects', emailMe: 'Email me', viewAll: 'View all projects →', moreAbout: 'More about me →', viewProject: 'View project →', builtWith: 'Built with Next.js.', sample: 'SAMPLE SCREENSHOT', stackLabel: 'Stack', dataLabel: 'Data layer', personal: 'Personal project', learning: 'Learning project'
  }
}
