import { COUNTRIES } from "@/content/site";
import { CountryPage } from "@/components/site/country-page";

export const metadata = { title: `${COUNTRIES.japan.name} — Гарц`, description: COUNTRIES.japan.heroText };

export default function Page() {
  return <CountryPage slug="japan" />;
}
