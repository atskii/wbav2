import { ArrowRight, Check, ShieldCheck, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const wbaPoints = [
  "Plan dnia dopasowany do Twoich możliwości",
  "Kompleksowa analiza Twojego nastroju",
  "Czytelne wykresy trendów samopoczucia na przestrzeni tygodni",
  "Wczesne sygnały ostrzegawcze, gdy rośnie ryzyko wypalenia",
  "Spersonalizowane wskazówki AI, jak zadbać o energię w ciągu dnia",
  "Motywacyjna gamifikacja",
  "Synchronizacja z Kalendarzem Google i dostęp na telefonie oraz komputerze",
];

const othersPoints = [
  "Planuje tak samo niezależnie od Twojej energii i możliwości",
  "Zero śledzenia nastroju i kontekstu emocjonalnego dnia",
  "Brak historii tego, co wpływa na Twój spadek formy",
  "Ślepy na wielodniowe przeciążenie i pierwsze oznaki wypalenia",
  "Sucha lista zadań bez żadnych podpowiedzi regeneracyjnych",
  "Zimna, bezosobowa tabela bez motywacji i wsparcia",
  "Rozproszone notatki bez jednego spójnego widoku dnia",
];

function CheckRow({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[4px] bg-[#0E6630]">
        <Check className="size-3 text-white stroke-[2.5]" aria-hidden="true" />
      </span>
      <span className="text-sm text-foreground leading-relaxed">{text}</span>
    </li>
  );
}

function CrossRow({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[4px] bg-muted">
        <X className="size-3 text-muted-foreground stroke-[2.5]" aria-hidden="true" />
      </span>
      <span className="text-sm text-muted-foreground leading-relaxed">{text}</span>
    </li>
  );
}

export interface ComparisonBlockProps {
  id?: string;
  onCTA?: (mode: "login" | "register") => void;
  onExplore?: () => void;
}

export default function ComparisonBlock({
  id = "o-nas",
  onCTA,
  onExplore,
}: ComparisonBlockProps) {
  return (
    <section
      id={id}
      className="scroll-mt-20 flex w-full items-center justify-center bg-[#FCFCFD] border-y border-gray-100 px-4 md:px-8 py-14 md:py-24 text-foreground"
    >
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-10 md:mb-12 text-center">
          <Badge
            variant="outline"
            className="mb-4 gap-1.5 border-[#0E6630]/30 bg-[#E8F5EC]/60 px-3 py-1 text-[#0E6630]"
          >
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Dlaczego Wellbeing App
          </Badge>
          <h2 className="text-[26px] font-bold tracking-tight text-[#151515] sm:text-4xl">
            Wellbeing App vs zwykły planer
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm md:text-base text-muted-foreground leading-relaxed">
            Zwykłe listy zadań tylko dokładają presji. Zaprojektowaliśmy planer,
            który dopasowuje dzień do Twojej realnej energii.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 items-stretch">
          <Card className="flex flex-col border-[#0E6630]/30 ring-1 ring-[#0E6630]/15 bg-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold text-[#151515]">
                  Wellbeing App
                </CardTitle>
                <Badge className="bg-[#0E6630] text-white hover:bg-[#0B5226]">
                  Rekomendowane
                </Badge>
              </div>
              <CardDescription>
                Wszystko, czego potrzebujesz do spokojnego planowania dnia bez presji.
              </CardDescription>
            </CardHeader>

            <Separator />

            <CardContent className="flex-1 pt-5">
              <ul className="flex flex-col gap-3.5">
                {wbaPoints.map((point) => (
                  <CheckRow key={point} text={point} />
                ))}
              </ul>
            </CardContent>

            <CardFooter className="border-t pt-5">
              <Button
                type="button"
                onClick={() => onCTA?.("register")}
                className="w-full gap-2 bg-[#0E6630] text-white hover:bg-[#0B5226] cursor-pointer"
              >
                Ułóż swój dzień za darmo
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col bg-muted/35 border-border/80 shadow-none">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-muted-foreground">
                Zwykły planer / To-Do
              </CardTitle>
              <CardDescription>
                Typowe ograniczenia tradycyjnych list zadań i kalendarzy.
              </CardDescription>
            </CardHeader>

            <Separator />

            <CardContent className="flex-1 pt-5">
              <ul className="flex flex-col gap-3.5">
                {othersPoints.map((point) => (
                  <CrossRow key={point} text={point} />
                ))}
              </ul>
            </CardContent>

            <CardFooter className="border-t pt-5">
              <Button
                type="button"
                variant="secondary"
                onClick={onExplore}
                className="w-full gap-2 cursor-pointer"
              >
                Zobacz funkcje aplikacji
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
