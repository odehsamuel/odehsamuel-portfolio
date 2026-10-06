import Link from 'next/link'
export default function NotFound(){return <main className="container page prose-page"><span className="mono accent">404</span><h1>That page doesn&apos;t exist.</h1><p>Try heading back to the home page or the project index.</p><div className="inline-links"><Link href="/">Home</Link><Link href="/projects">Projects</Link></div></main>}
