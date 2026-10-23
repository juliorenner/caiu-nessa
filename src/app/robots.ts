import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// Páginas de texto e links de resultado podem ser indexados; a API e a imagem dos stories não.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/cartao'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
