import type { MetadataRoute } from "next"
import { locales } from "@/i18n/settings"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://decision-maker.vercel.app"

  // List of all routes without locale prefix
  const routes = [
    "",
    "/decision-matrix",
    "/decision-tree",
    "/pros-cons",
    "/swot-analysis",
    "/random-decision",
    "/weighted-random",
    "/eisenhower-matrix",
    "/cost-benefit",
    "/scenario-planning",
  ]

  // Generate sitemap entries for all routes in all locales
  const sitemap = locales.flatMap((locale) => {
    return routes.map((route) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
      // Add language alternates for each URL
      alternates: {
        languages: Object.fromEntries(locales.map((altLocale) => [altLocale, `${baseUrl}/${altLocale}${route}`])),
        canonical: `${baseUrl}/${locale}${route}`,
      },
    }))
  })

  return sitemap
}

