import './globals.css'
import { Analytics } from '@vercel/analytics/next'
export const metadata={title:'Odeh Samuel — Full-stack developer',description:'Odeh Samuel builds web applications with React, Next.js and Node.js.'}
export const viewport={colorScheme:'light',themeColor:'#F6F4EE',userScalable:false}
export default function RootLayout({children}){return <html lang="en"><body>{children}{process.env.NODE_ENV==='production'&&<Analytics/>}</body></html>}
