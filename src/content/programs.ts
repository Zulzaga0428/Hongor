/**
 * Улс, хөтөлбөр, явцын шат, бичиг баримтын жагсаалт.
 * ⚠️ Солонгос, Чехийн хөтөлбөрүүдийг эгчээс тодруулж засна.
 */

export const COUNTRIES = {
  japan: { name: "Япон", code: "JP", programs: ["Ур чадварын дадлагажигч (技能実習)", "Тусгай ур чадвар (特定技能)", "Мэргэжилтэн (技術・人文知識・国際業務)", "Хэлний сургууль (留学)"] },
  korea: { name: "Солонгос", code: "KR", programs: ["EPS — хөдөлмөр эрхлэлтийн хөтөлбөр", "Бусад"] },
  czech: { name: "Чех", code: "CZ", programs: ["Ажлын виз", "Бусад"] },
} as const;

export type CountryId = keyof typeof COUNTRIES;
export const COUNTRY_IDS = Object.keys(COUNTRIES) as CountryId[];
export const isCountry = (x: unknown): x is CountryId => typeof x === "string" && x in COUNTRIES;

export const JOB_TYPES = [
  "Барилга",
  "Хөдөө аж ахуй",
  "Мал аж ахуй",
  "Үйлдвэр",
  "Ойн аж ахуй",
  "Асаргаа",
  "Гагнуур",
  "Хүнсний үйлдвэр",
  "Бусад",
] as const;

export const EDUCATION = ["Бүрэн дунд", "Мэргэжлийн (МСҮТ)", "Бакалавр", "Магистр ба түүнээс дээш"] as const;

/** Сурагч бүртгүүлснээс нисэх хүртэлх зам. Дараалал чухал. */
export const STAGES = [
  { id: "registered", name: "Бүртгүүлсэн", short: "Бүртгэл" },
  { id: "training", name: "Хэлний сургалтад", short: "Сургалт" },
  { id: "exam_passed", name: "Шалгалт тэнцсэн", short: "Шалгалт" },
  { id: "interview", name: "Ярилцлагад", short: "Ярилцлага" },
  { id: "selected", name: "Сонгогдсон", short: "Сонгогдсон" },
  { id: "visa", name: "Виз хүлээж буй", short: "Виз" },
  { id: "departed", name: "Нисэв ✈", short: "Нисэв" },
] as const;

/** Шатны гаднах төлөв — замаас гарсан хүн. */
export const PAUSED = { id: "paused", name: "Түр зогссон", short: "Зогссон" } as const;

export type StageId = (typeof STAGES)[number]["id"] | typeof PAUSED.id;
export const isStage = (x: unknown): x is StageId =>
  typeof x === "string" && (x === PAUSED.id || STAGES.some((s) => s.id === x));
export const stageName = (id: string) => (id === PAUSED.id ? PAUSED.name : STAGES.find((s) => s.id === id)?.name ?? id);
export const stageIndex = (id: string) => STAGES.findIndex((s) => s.id === id);

export const DOC_KINDS = [
  { id: "id_card", name: "Иргэний үнэмлэх", hint: "Нүүр, ар талын зураг", required: true },
  { id: "photo", name: "Цээж зураг", hint: "Цагаан фонтой, 3×4", required: true },
  { id: "diploma", name: "Боловсролын баримт", hint: "Гэрчилгээ эсвэл диплом", required: true },
  { id: "passport", name: "Гадаад паспорт", hint: "Зурагтай хуудас. Байхгүй бол дараа нь", required: false },
  { id: "health", name: "Эрүүл мэндийн үзлэг", hint: "Байгаа бол", required: false },
  { id: "other", name: "Бусад баримт", hint: "Сертификат, ажлын тодорхойлолт г.м.", required: false },
] as const;

export type DocKind = (typeof DOC_KINDS)[number]["id"];
export const isDocKind = (x: unknown): x is DocKind => typeof x === "string" && DOC_KINDS.some((d) => d.id === x);
export const docName = (id: string) => DOC_KINDS.find((d) => d.id === id)?.name ?? id;
