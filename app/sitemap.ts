import { MetadataRoute } from 'next'
// Import your supabase client or data fetching logic here if needed

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://yum-yum-pi.vercel.app' // Replace with your actual domain

  // 1. Static Routes
  const routes = [
    '',
    '/about',
    '/pricing',
    '/register',
    '/login',
    '/matching',
    '/oems',
    '/trust',
    '/results',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 1,
  }))

  // 2. Dynamic Routes (Fetch your OEMs from DB)
  // const oems = await getOemsFromSupabase() 
  // const oemRoutes = oems.map((oem) => ({
  //   url: `${baseUrl}/oem/${oem.slug}`,
  //   lastModified: new Date(oem.updated_at),
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.8,
  // }))

  return [...routes /*, ...oemRoutes */]
}