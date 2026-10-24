'use client'

import Link from 'next/link'
import { ArrowUpRight, Mail } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { siteConfig } from '@/content/site-config'
import { getTechUsage } from '@/lib/content/projects'
import { PlaceholderImage } from './placeholder-image'
import { HeroPortrait } from './hero-portrait'

export function Reveal({ children, delay = 0, y = 14, className = '' }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={
        reduced
          ? { duration: 0 }
          : { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }
      }
    >
      {children}
    </motion.div>
  )
}

export function SectionHeader({ number, title, link }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className="section-header"
      initial={reduced ? false : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={reduced ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' }}
    >
      <span className="mono section-number">{number}</span>
      <h2>{title}</h2>
      {link && (
        <Link href={link.href} className="mono section-header-link">
          {link.label}
        </Link>
      )}
    </motion.div>
  )
}

export function Intro() {
  const reduced = useReducedMotion()
  const hasPortrait = Boolean(siteConfig.heroImage)

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: reduced ? 0 : 0.08,
        delayChildren: reduced ? 0 : 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: reduced ? 0 : 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduced ? 0 : 0.4,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <section className={`intro ${hasPortrait ? 'intro-with-portrait' : ''}`}>
      <motion.div
        className="intro-text"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="mono eyebrow">
          {siteConfig.labels.introEyebrow}
        </motion.div>

        <motion.h1 variants={itemVariants}>
          I&apos;m {siteConfig.name}, a {siteConfig.role}.
        </motion.h1>

        <motion.p variants={itemVariants}>
          I build web applications with React, Next.js and Node.js, using MongoDB or PostgreSQL depending on what the data needs.
        </motion.p>

        <motion.div variants={itemVariants} className="mono stack-line">
          {siteConfig.labels.stack}
        </motion.div>

        <motion.div variants={itemVariants} className="cta-row">
          <Link className="button-primary" href="/#selected-projects">
            {siteConfig.labels.seeProjects}
          </Link>
          <a className="text-link" href={'mailto:' + siteConfig.email}>
            <span>{siteConfig.labels.emailMe}</span>
            <Mail aria-hidden="true" size={16} />
          </a>
        </motion.div>
      </motion.div>

      {hasPortrait && (
        <motion.div
          className="intro-portrait"
          initial={reduced ? false : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 0.5, delay: 0.15, ease: 'easeOut' }
          }
        >
          <HeroPortrait />
        </motion.div>
      )}
    </section>
  )
}

function Context({ project }) {
  return (
    <span className="mono context">
      {project.context === 'learning'
        ? siteConfig.labels.learning
        : siteConfig.labels.personal}
    </span>
  )
}

export function FeaturedProject({ project, index }) {
  const db = project.stack.databases?.[0]

  return (
    <Reveal delay={index * 0.06}>
      <article className="case-file">
        <div className="case-meta mono">
          <span>{String(index + 1).padStart(2, '0')}</span>
          <span className={project.status === 'completed' ? 'status-completed' : 'status-in-progress'}>
            <i className={`status-dot ${project.status === 'completed' ? 'completed' : ''}`} />
            {project.status}
          </span>
          <Context project={project} />
        </div>

        <Link
          href={'/projects/' + project.slug}
          aria-label={`View ${project.title}`}
        >
          <PlaceholderImage
            src={project.cover?.src}
            alt={project.cover?.alt || `${project.title} screenshot`}
          />
        </Link>

        <div className="case-grid">
          <div>
            <h3>
              <Link href={'/projects/' + project.slug}>{project.title}</Link>
            </h3>
            <p>{project.summary}</p>
          </div>

          <dl className="data-list mono">
            <div>
              <dt>{siteConfig.labels.stackLabel}</dt>
              <dd>
                {[
                  ...(project.stack.frontend || []),
                  ...(project.stack.backend || []),
                ]
                  .slice(0, 4)
                  .join(' · ')}
              </dd>
            </div>
            <div>
              <dt>{siteConfig.labels.dataLabel}</dt>
              <dd>{db ? db.name + ' · ' + db.type : '—'}</dd>
            </div>
            <div>
              <dt>Links</dt>
              <dd>
                {project.links?.github && (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub <ArrowUpRight aria-hidden="true" size={13} />
                  </a>
                )}
              </dd>
            </div>
          </dl>
        </div>

        <Link className="amber-link" href={'/projects/' + project.slug}>
          <span>{siteConfig.labels.viewProject}</span>
        </Link>
      </article>
    </Reveal>
  )
}

export function WhatIBuild() {
  const rows = [
    [
      'Booking and reservation systems.',
      'Reservation and appointment flows with user accounts and stored data (restaurant reservations, dental clinic scheduling).',
    ],
    [
      'Apps with user accounts and personal data.',
      'Registration, login and per-user data, as in the habit tracker.',
    ],
    [
      'Express-backed React and Next.js applications.',
      'Frontends that talk to Node.js and Express APIs, with MongoDB or PostgreSQL behind them.',
    ],
  ]

  return (
    <section id="what-i-build">
      <SectionHeader number="03" title={siteConfig.labels.whatIBuild} />
      <dl className="definition-list">
        {rows.map(([a, b], idx) => (
          <Reveal key={a} delay={idx * 0.05} y={10}>
            <div>
              <dt>{a}</dt>
              <dd>{b}</dd>
            </div>
          </Reveal>
        ))}
      </dl>
    </section>
  )
}

export function Toolkit() {
  const usage = getTechUsage()
  const rows = [
    ['Interface', siteConfig.toolkit.interface],
    ['Server', siteConfig.toolkit.server],
    ['Relational', siteConfig.toolkit.data.relational],
    ['Document', siteConfig.toolkit.data.document],
  ]

  return (
    <section id="toolkit">
      <SectionHeader number="04" title={siteConfig.labels.toolkit} />
      <div className="toolkit-list">
        {rows.map(([label, items], idx) => (
          <Reveal key={label} delay={idx * 0.04} y={10}>
            <div className="toolkit-row">
              <span className="mono">{label}</span>
              <div>
                {items.map((t) =>
                  usage[t] ? (
                    <Link
                      href={'/projects?tech=' + encodeURIComponent(t.toLowerCase())}
                      key={t}
                    >
                      {t} <small>({usage[t].length})</small>
                    </Link>
                  ) : (
                    <span key={t}>{t}</span>
                  )
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export function AboutPreview() {
  return (
    <section id="about">
      <SectionHeader number="06" title={siteConfig.labels.about} />
      <Reveal y={12}>
        <div className="reading">
          <p>
            I&apos;m a full-stack developer working with the MERN stack, Next.js and PostgreSQL. I&apos;ve built habit-tracking, reservation and scheduling applications as personal and learning projects. I choose between document and relational databases based on how the data is shaped: MongoDB for the document-style projects here, PostgreSQL for the scheduling project.
          </p>
          <Link className="amber-link" href="/about">
            <span>{siteConfig.labels.moreAbout}</span>
          </Link>
        </div>
      </Reveal>
    </section>
  )
}

export function GetInTouch() {
  return (
    <section id="get-in-touch">
      <SectionHeader number="07" title={siteConfig.labels.contact} />
      <Reveal y={12}>
        <div className="reading">
          <p>Have a project in mind? Email me.</p>
          <a className="contact-email" href={'mailto:' + siteConfig.email}>
            {siteConfig.email}
          </a>
          <div className="external-links">
            <a href={siteConfig.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a
              href={siteConfig.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <a href={siteConfig.resumePath} download>
              Résumé (PDF)
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
