import { Hero } from '@/components/home/Hero'
import { FeaturedWork } from '@/components/home/FeaturedWork'
import { AboutPreview } from '@/components/home/AboutPreview'
import { CTASection } from '@/components/home/CTASection'

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedWork />
      <AboutPreview />
      <CTASection />
    </>
  )
}
