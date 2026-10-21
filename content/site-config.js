export const siteConfig = {
  name: 'Odeh Samuel', role: 'Full-stack developer', email: 'hello@example.com',
  github: 'https://github.com/SAMPLE', linkedin: 'https://www.linkedin.com/in/SAMPLE', resumePath: '/resume.pdf',
  // Recommended image is 4:5 portrait, about 1200x1500px, under 300KB. Save in public/images/ (e.g. /images/portrait.jpg)
  heroImage: {
    src: null,
    alt: 'SAMPLE: portrait of Odeh Samuel',
    caption: null,
  },
  placeholderFields: ['email', 'github', 'linkedin', 'resumePath', 'heroImage'],
  availability: 'Open to freelance projects and junior full-stack roles.', filterThreshold: 8,
  nav: [{ label: 'Projects', href: '/projects' }, { label: 'About', href: '/about' }, { label: 'Contact', href: '/contact' }, { label: 'Résumé', href: '/resume' }],
  howIWork: [],
  toolkit: { interface: ['React', 'Next.js', 'JavaScript', 'HTML/CSS', 'Tailwind CSS', 'Framer Motion'], server: ['Node.js', 'Express.js', 'REST APIs', 'Authentication (JWT, sessions)', 'Cloudinary/Multer'], data: { relational: ['PostgreSQL', 'MySQL', 'SQL', 'Database design'], document: ['MongoDB'] } },
  labels: { introEyebrow: 'Full-stack developer', stack: 'React · Next.js · Node.js · Express · MongoDB · PostgreSQL', selected: 'Selected projects', whatIBuild: 'What I build', toolkit: 'Toolkit', about: 'About', contact: 'Get in touch', seeProjects: 'See my projects', emailMe: 'Email me', viewAll: 'View all projects →', moreAbout: 'More about me →', viewProject: 'View project →', builtWith: 'Built with Next.js.', sample: 'SAMPLE SCREENSHOT', stackLabel: 'Stack', dataLabel: 'Data layer', personal: 'Personal project', learning: 'Learning project'
  }
}
