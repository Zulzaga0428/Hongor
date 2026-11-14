import { COUNTRIES } from "@/content/site";
import { CountryPage } from "@/components/site/country-page";

export const metadata = { title: `${COUNTRIES.korea.name} — Гарц`, description: COUNTRIES.korea.heroText };

export default function Page() {
  return <CountryPage slug="korea" />;
}
