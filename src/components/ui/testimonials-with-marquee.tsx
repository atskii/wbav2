import { cn } from "@/lib/utils"
import { TestimonialCard, TestimonialAuthor } from "@/components/ui/testimonial-card"

export interface TestimonialsSectionProps {
  id?: string
  badge?: string
  title: string
  description: string
  testimonials: Array<{
    author: TestimonialAuthor
    text: string
    href?: string
  }>
  className?: string
}

export function TestimonialsSection({
  id,
  badge = "Opinie",
  title,
  description,
  testimonials,
  className,
}: TestimonialsSectionProps) {
  const trackItems =
    testimonials.length < 5 ? [...testimonials, ...testimonials] : testimonials

  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-20 bg-white text-[#151515]",
        "py-12 md:py-20 px-0 overflow-hidden",
        className
      )}
    >
      <div className="mx-auto flex max-w-container flex-col items-center gap-8 text-center sm:gap-12">
        <div className="flex flex-col items-center gap-3 px-4 sm:gap-4">
          {badge && (
            <span className="inline-block px-4 py-1 border border-[#0E6630] text-[#0E6630] rounded-full text-sm font-semibold">
              {badge}
            </span>
          )}
          <h2 className="max-w-[720px] text-[24px] md:text-4xl font-bold leading-tight text-[#151515]">
            {title}
          </h2>
          <p className="text-base md:text-lg max-w-[600px] text-[#5A5A5A] leading-relaxed">
            {description}
          </p>
        </div>

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <div className="group flex w-full overflow-hidden p-2 [--gap:1.25rem] [gap:var(--gap)] flex-row [--duration:45s]">
            {[0, 1].map((trackIdx) => (
              <div
                key={trackIdx}
                aria-hidden={trackIdx === 1}
                className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused]"
              >
                {trackItems.map((testimonial, i) => (
                  <TestimonialCard
                    key={`${trackIdx}-${i}-${testimonial.author.name}`}
                    {...testimonial}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 md:w-1/6 bg-gradient-to-r from-white sm:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 md:w-1/6 bg-gradient-to-l from-white sm:block" />
        </div>
      </div>
    </section>
  )
}
