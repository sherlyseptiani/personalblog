import { createAdminClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Title to slug mapping
const titleToSlug: Record<string, string> = {
  "The Strange Creature That Made Me Think About Evolution": "shark-ray",
  "Explosives and Nobel Prize": "explosives-and-nobel",
  "DELF B2 : Production écrite": "delf-b2-production-ecrite",
  "Calvin and Hobbes": "calvin-and-hobbes-boy-and-ontology-of",
  "Small Beginnings": "random-thoughts",
  "Why Learn French": "why-learn-french",
  "Ethical Questions on Animal Liberation": "ethical-questions-on-animal-liberation",
  "Latin: The Ghost of A Dead Language": "latin-ghost-of-dead-language",
  "Why British Love Their Queen": "why-british-love-their-queen",
  "Queen Elizabeth II's Diamond Jubilee": "queen-elizabeth-iis-diamond-jubilee",
  "How Religion Matters to Me": "how-deism-matters-to-me",
  "The 170,000-year-old Sunlight": "the-170000-year-old-sunlight",
  "Should you buy a Kindle?": "should-you-buy-kindle",
  "George Carlin's Save The Planet": "george-carlins-save-planet",
  "Let's Save The Javan Rhinos!": "lets-save-javan-rhinos",
  "The Chemical Tale of Silicon": "the-chemical-tale-of-silicon",
  "One True God: The Cost and Journey Towards Monotheism": "one-true-god-cost-of-journey-towards",
  "First Post": "first-post",
  "Nowhere To Hide": "nowhere-to-hide",
  "A world made of two words": "a-world-made-of-two-words",
  "Goodbye 2020": "2020-check-in",
  "Rincian Donasi Badak Jawa": "rincian-donasi-badak-jawa",
  "Why You Should Read Books": "why-you-should-read-books",
  "Writing Practice: 스트레스가 많을 때 어떻게 해요?": "korean-practice",
  "How Twitter Makes Money": "how-twitter-makes-money",
  "Blogging with Your iPad": "blogging-with-your-ipad",
  "Chinese on London Olympics 2012": "chinese-on-london-olympics-2012",
  "Leaders' Pay Cuts": "leaders-pay-cuts",
  "Why are insects smaller now?": "why-are-insects",
  "Laniakea - The Immeasurable Heaven": "laniakea-immeasurable"
}

export async function POST() {
  const supabase = createAdminClient()
  const results: Array<{ slug: string; title: string; status: string; error?: string }> = []

  for (const [title, slug] of Object.entries(titleToSlug)) {
    const cover_art = {
      svg_url: `/thumbnails/${slug}.svg`,
      type: 'svg'
    }

    console.log(`Updating ${slug}...`, JSON.stringify(cover_art))

    // Update cover_art to use local SVG
    const { data, error } = await supabase
      .from('posts')
      .update({ cover_art })
      .eq('slug', slug)
      .select('slug, cover_art')

    if (error) {
      console.error(`Error updating ${slug}:`, error)
      results.push({ slug, title, status: 'error', error: error.message })
    } else {
      results.push({ slug, title, status: 'success' })
    }
  }

  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length

  return NextResponse.json({
    total: results.length,
    success: successCount,
    errors: errorCount,
    results
  })
}
