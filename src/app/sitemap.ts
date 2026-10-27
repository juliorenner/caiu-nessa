import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

const ATUALIZADO = new Date('2026-10-26')

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, lastModified: ATUALIZADO, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/afirmacoes`, lastModified: ATUALIZADO, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/como-escolhemos`, lastModified: ATUALIZADO, changeFrequency: 'monthly', priority: 0.5 },
  ]
}
