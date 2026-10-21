import { Newsreader, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'
const newsreader=Newsreader({subsets:['latin'],variable:'--font-newsreader',weight:['400','500']})
const hanken=Hanken_Grotesk({subsets:['latin'],variable:'--font-hanken',weight:['400','500']})
const mono=JetBrains_Mono({subsets:['latin'],variable:'--font-mono',weight:['400','500']})
export const metadata={title:'Odeh Samuel — Full-stack developer',description:'Full-stack developer portfolio for Odeh Samuel'}
export const viewport={width:'device-width',initialScale:1,colorScheme:'dark',themeColor:'#171614'}
export default function RootLayout({children}){return <html lang="en" className={`${newsreader.variable} ${hanken.variable} ${mono.variable}`}><body>{children}</body></html>}
