/**
 * Нийтийн сайтын контент. Нэр, уриа, улс бүрийн өнгө/текст — БҮГД энд.
 * ⚠️ «Гарц» бол түр нэр. Жинхэнэ нэр шийдэгдэхэд BRAND-ийг л солино.
 * ⚠️ Хөтөлбөр, шаардлагын нарийн мэдээллийг эгчээс (Хонгор Түрүү) тодруулж засна —
 *    тоо (цалин, хугацаа) зохиож бичихгүй.
 */

export const BRAND = {
  name: "Гарц",
  tagline: "Гадаадад ажиллах албан ёсны зам",
  partner: "Хонгор Түрүү",
  phone: "",
  email: "",
};

export type CountrySlug = "korea" | "japan" | "czech";

export type CountryTheme = {
  slug: CountrySlug;
  name: string;
  /** Тухайн улсын хэлээр нэр — том чимэглэл болж харагдана */
  native: string;
  hello: string;
  city: string;
  /** Тугны өнгөнөөс */
  primary: string;
  accent: string;
  soft: string;
  heroTitle: string;
  heroText: string;
  cardText: string;
  programs: { title: string; text: string }[];
  /** Хэлний сургалт хаана байгаа — одоохондоо зөвхөн япон хэл бэлэн */
  courseReady: boolean;
  /** Нүүрний hero ба карт. /public/hero/... — байхгүй бол градиент+бичиг харагдана */
  image?: string;
  /** Улсын хуудасны hero (нүүрнийхээс өөр зураг) */
  pageImage?: string;
};

/*
 * Зургийн эх сурвалж — Unsplash License (худалдааны зорилгоор үнэгүй, зохиогчийг
 * дурдах албагүй ч энд тэмдэглэв). Хүмүүсийн зургийг stock биш, ЖИНХЭНЭ архиваас авна.
 *   kr-palace  Daniel Bernard     https://unsplash.com/photos/RbaGeW_LbGs
 *   kr-seoul   Ignat Khailov      https://unsplash.com/photos/7mrkk8iQZFE
 *   jp-fuji    Max Bender         https://unsplash.com/photos/FuxYvi-hcWQ
 *   jp-tokyo   Louie Martinez     https://unsplash.com/photos/IocJwyqRv3M
 *   cz-bridge  William Zhang      https://unsplash.com/photos/6En4WYsNYXM
 *   cz-vitus   David Fucsku       https://unsplash.com/photos/0yLnMHfkwkU
 */

export const COUNTRIES: Record<CountrySlug, CountryTheme> = {
  korea: {
    slug: "korea",
    name: "Солонгос",
    native: "한국",
    hello: "안녕하세요",
    city: "Сөүл",
    primary: "#0047A0",
    accent: "#CD2E3A",
    soft: "#EAF0FA",
    heroTitle: "Солонгост ажиллах албан ёсны зам",
    heroText: "Хөдөлмөр эрхлэлтийн хөтөлбөрт бэлтгэл, солонгос хэлний сургалт, бичиг баримт — нэг дор.",
    cardText: "Үйлдвэр, хөдөө аж ахуйн салбарт хөдөлмөр эрхлэлтийн хөтөлбөр",
    programs: [
      { title: "EPS хөтөлбөр", text: "Хөдөлмөр эрхлэлтийн зөвшөөрлийн систем — үйлдвэр, хөдөө аж ахуй, барилга." },
      { title: "Солонгос хэлний бэлтгэл", text: "Хэлний шалгалтад бэлдэх сургалт, жишиг тест." },
      { title: "Бичиг баримтын туслалцаа", text: "Анкет, баримтаа онлайнаар илгээж, явцаа хянана." },
    ],
    courseReady: false,
    image: "/hero/kr-palace.jpg",
    pageImage: "/hero/kr-seoul.jpg",
  },
  japan: {
    slug: "japan",
    name: "Япон",
    native: "日本",
    hello: "こんにちは",
    city: "Токио",
    primary: "#BC002D",
    accent: "#1F1A1C",
    soft: "#FDEEF1",
    heroTitle: "Японд ажиллах мөрөөдлөө биелүүл",
    heroText: "Ур чадварын дадлага, тусгай ур чадварын визээр — япон хэлний сургалтаас нислэг хүртэл.",
    cardText: "Ур чадварын дадлагажигч, тусгай ур чадвар, мэргэжилтний виз",
    programs: [
      { title: "Ур чадварын дадлагажигч (技能実習)", text: "Барилга, хөдөө аж ахуй, үйлдвэр, хүнсний салбарт." },
      { title: "Тусгай ур чадвар (特定技能)", text: "Асаргаа, гагнуур, барилга зэрэг салбарт ажиллах виз." },
      { title: "Япон хэлний сургалт", text: "Анхан, дунд, ахисан шат — онлайн хичээл, тест, багшийн даалгавар." },
    ],
    courseReady: true,
    image: "/hero/jp-fuji.jpg",
    pageImage: "/hero/jp-tokyo.jpg",
  },
  czech: {
    slug: "czech",
    name: "Чех",
    native: "Česko",
    hello: "Dobrý den",
    city: "Праг",
    primary: "#11457E",
    accent: "#D7141A",
    soft: "#EAF0F7",
    heroTitle: "Европын зүрх Чехэд ажиллах боломж",
    heroText: "Ажлын визээр Европт ажиллах — бүртгэл, бэлтгэл, бичиг баримтын бүх алхамд хамт.",
    cardText: "Европын холбооны орон — ажлын визийн хөтөлбөр",
    programs: [
      { title: "Ажлын виз", text: "Үйлдвэр, үйлчилгээний салбарт ажиллах хөтөлбөр." },
      { title: "Бэлтгэл сургалт", text: "Хэл, соёл, ажлын байрны дүрэм журам." },
      { title: "Бичиг баримтын туслалцаа", text: "Анкет, баримтаа онлайнаар илгээж, явцаа хянана." },
    ],
    courseReady: false,
    image: "/hero/cz-bridge.jpg",
    pageImage: "/hero/cz-vitus.jpg",
  },
};

export const COUNTRY_ORDER: CountrySlug[] = ["korea", "japan", "czech"];

/** Бүх улсад нийтлэг алхам — сурагчийн явцын 7 шаттай уялдана. */
export const STEPS = [
  { title: "Бүртгүүлэх", text: "Утасны дугаараараа 1 минутад бүртгэл үүсгэнэ." },
  { title: "Анкет, баримт", text: "Анкетаа бөглөж, бичиг баримтаа утсаараа хуулна." },
  { title: "Хэлний сургалт", text: "Түвшиндээ тохирсон онлайн хичээл, тест, даалгавар." },
  { title: "Шалгалт, ярилцлага", text: "Хэлний шалгалт өгч, ажил олгогчтой ярилцлага хийнэ." },
  { title: "Виз, нислэг", text: "Виз гарсны дараа шинэ ажилдаа нисэнэ." },
];
