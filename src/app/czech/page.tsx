import { COUNTRIES } from "@/content/site";
import { CountryPage } from "@/components/site/country-page";

export const metadata = { title: `${COUNTRIES.czech.name} — Гарц`, description: COUNTRIES.czech.heroText };

export default function Page() {
  return <CountryPage slug="czech" />;
}
