import { siteConfig } from '@/content/site-config'
export function PlaceholderImage({src,alt}){return src?<img className="placeholder-image" src={src} alt={alt}/>:<div className="placeholder-image" role="img" aria-label={alt}><span className="mono">{siteConfig.labels.sample}</span></div>}
