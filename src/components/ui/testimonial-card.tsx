import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export interface TestimonialAuthor {
  name: string
  handle: string
  avatar?: string
  initials?: string
}

export interface TestimonialCardProps {
  author: TestimonialAuthor
  text: string
  href?: string
  className?: string
}

export function TestimonialCard({
  author,
  text,
  href,
  className,
}: TestimonialCardProps) {
  const Card = href ? "a" : "div"
  const fallbackInitials =
    author.initials ||
    author.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()

  return (
    <Card
      {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "flex flex-col rounded-2xl border border-[#E8DDD0]",
        "bg-gradient-to-b from-[#F8FAF9] to-white",
        "p-5 sm:p-6 text-start",
        "hover:border-[#0E6630]/35 hover:shadow-md",
        "w-[300px] sm:w-[340px] shrink-0",
        "transition-all duration-300",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-11 w-11 border border-[#E8DDD0]/80">
          {author.avatar && (
            <AvatarImage
              src={author.avatar}
              alt={author.name}
              loading="lazy"
              decoding="async"
            />
          )}
          <AvatarFallback className="bg-[#E8F5EC] text-[#0E6630] font-bold text-sm">
            {fallbackInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start min-w-0">
          <h3 className="text-sm sm:text-base font-bold leading-tight text-[#151515] truncate w-full">
            {author.name}
          </h3>
          <p className="text-xs text-[#5A5A5A] mt-0.5 truncate w-full">
            {author.handle}
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm text-[#151515]/85 leading-relaxed">
        „{text}”
      </p>
    </Card>
  )
}
