/**
 * Хичээлийн агуулга. Багш шинэ хичээл нэмэх самбар дараагийн шатанд —
 * одоохондоо энд бичигдэнэ.
 */

export type LevelId = "anhan" | "dund" | "ahisan";

export const LEVELS: Record<LevelId, { name: string; jp: string; jlpt: string; desc: string }> = {
  anhan: { name: "Анхан шат", jp: "初級", jlpt: "N5", desc: "Хирагана, мэндчилгээ, өөрийгөө танилцуулах" },
  dund: { name: "Дунд шат", jp: "中級", jlpt: "N4", desc: "Үйл үгийн хэлбэр, ажлын байрны хэллэг" },
  ahisan: { name: "Ахисан шат", jp: "上級", jlpt: "N3", desc: "Хүндэтгэлийн хэл, ажлын ярилцлага" },
};

export const LEVEL_IDS = Object.keys(LEVELS) as LevelId[];

export function isLevel(x: unknown): x is LevelId {
  return typeof x === "string" && x in LEVELS;
}

export type Section =
  | { type: "note"; title: string; text: string }
  | { type: "kana"; title: string; rows: [string, string][][] }
  | { type: "words"; title: string; items: { jp: string; romaji: string; mn: string }[] };

export type Question = { q: string; options: string[]; answer: number };

export type Lesson = {
  id: string;
  level: LevelId;
  title: string;
  minutes: number;
  sections: Section[];
  quiz: Question[];
};

const r = (...pairs: string[]): [string, string][] => {
  const out: [string, string][] = [];
  for (let i = 0; i < pairs.length; i += 2) out.push([pairs[i], pairs[i + 1]]);
  return out;
};

export const LESSONS: Lesson[] = [
  // ---------------- АНХАН ----------------
  {
    id: "anhan-1",
    level: "anhan",
    title: "Хирагана 1: あ〜の",
    minutes: 15,
    sections: [
      {
        type: "note",
        title: "Хирагана гэж юу вэ?",
        text: "Хирагана бол япон хэлний үндсэн үсэг. Нийт 46 үсэгтэй. Эхлээд あいうえお гэсэн 5 эгшгийг цээжил. Бусад үсэг нь гийгүүлэгч дээр эгшиг нэмсэн байдаг: か = k + a.",
      },
      {
        type: "kana",
        title: "Эхний 25 үсэг",
        rows: [
          r("あ", "a", "い", "i", "う", "u", "え", "e", "お", "o"),
          r("か", "ka", "き", "ki", "く", "ku", "け", "ke", "こ", "ko"),
          r("さ", "sa", "し", "shi", "す", "su", "せ", "se", "そ", "so"),
          r("た", "ta", "ち", "chi", "つ", "tsu", "て", "te", "と", "to"),
          r("な", "na", "に", "ni", "ぬ", "nu", "ね", "ne", "の", "no"),
        ],
      },
    ],
    quiz: [
      { q: "«か» үсгийг яаж уншдаг вэ?", options: ["ki", "ka", "ko", "ta"], answer: 1 },
      { q: "«し» үсгийг яаж уншдаг вэ?", options: ["si", "chi", "shi", "tsu"], answer: 2 },
      { q: "«tsu» аль нь вэ?", options: ["つ", "す", "ち", "そ"], answer: 0 },
      { q: "«ne» аль нь вэ?", options: ["ぬ", "れ", "ね", "の"], answer: 2 },
      { q: "«え» үсгийг яаж уншдаг вэ?", options: ["e", "i", "o", "u"], answer: 0 },
    ],
  },
  {
    id: "anhan-2",
    level: "anhan",
    title: "Хирагана 2: は〜ん",
    minutes: 15,
    sections: [
      {
        type: "kana",
        title: "Үлдсэн 21 үсэг",
        rows: [
          r("は", "ha", "ひ", "hi", "ふ", "fu", "へ", "he", "ほ", "ho"),
          r("ま", "ma", "み", "mi", "む", "mu", "め", "me", "も", "mo"),
          r("や", "ya", "ゆ", "yu", "よ", "yo"),
          r("ら", "ra", "り", "ri", "る", "ru", "れ", "re", "ろ", "ro"),
          r("わ", "wa", "を", "o", "ん", "n"),
        ],
      },
      {
        type: "note",
        title: "Анхаар!",
        text: "«は» үсэг өгүүлбэрт сэдвийг заах үед «ва» гэж уншигдана: わたしは (ваташи ва). «を» нь «о» гэж уншигдах ба зөвхөн тусах тийн ялгал болж ордог.",
      },
    ],
    quiz: [
      { q: "«ふ» үсгийг яаж уншдаг вэ?", options: ["hu", "fu", "bu", "pu"], answer: 1 },
      { q: "«ri» аль нь вэ?", options: ["る", "ろ", "り", "れ"], answer: 2 },
      { q: "«わたしは» дахь «は»-г яаж уншдаг вэ?", options: ["ha", "wa", "ba", "a"], answer: 1 },
      { q: "«ん» үсгийг яаж уншдаг вэ?", options: ["n", "m", "nu", "no"], answer: 0 },
      { q: "«me» аль нь вэ?", options: ["ぬ", "ね", "め", "あ"], answer: 2 },
    ],
  },
  {
    id: "anhan-3",
    level: "anhan",
    title: "Мэндчилгээ",
    minutes: 10,
    sections: [
      {
        type: "words",
        title: "Өдөр тутмын мэндчилгээ",
        items: [
          { jp: "おはようございます", romaji: "ohayō gozaimasu", mn: "Өглөөний мэнд" },
          { jp: "こんにちは", romaji: "konnichiwa", mn: "Сайн байна уу (өдөр)" },
          { jp: "こんばんは", romaji: "konbanwa", mn: "Оройн мэнд" },
          { jp: "ありがとうございます", romaji: "arigatō gozaimasu", mn: "Баярлалаа" },
          { jp: "すみません", romaji: "sumimasen", mn: "Уучлаарай" },
          { jp: "はじめまして", romaji: "hajimemashite", mn: "Танилцахад таатай байна" },
          { jp: "よろしくおねがいします", romaji: "yoroshiku onegaishimasu", mn: "Хамтдаа сайн ажиллая" },
          { jp: "さようなら", romaji: "sayōnara", mn: "Баяртай" },
        ],
      },
    ],
    quiz: [
      { q: "Өглөө ажилдаа ирээд юу гэж мэндлэх вэ?", options: ["こんばんは", "おはようございます", "さようなら", "すみません"], answer: 1 },
      { q: "«ありがとうございます» гэдэг нь юу вэ?", options: ["Уучлаарай", "Баяртай", "Баярлалаа", "Сайн уу"], answer: 2 },
      { q: "Анх танилцахдаа юу гэж хэлэх вэ?", options: ["はじめまして", "こんばんは", "さようなら", "すみません"], answer: 0 },
      { q: "«すみません» гэдэг нь юу вэ?", options: ["Баярлалаа", "Уучлаарай", "Оройн мэнд", "Тийм"], answer: 1 },
    ],
  },
  {
    id: "anhan-4",
    level: "anhan",
    title: "Өөрийгөө танилцуулах",
    minutes: 15,
    sections: [
      {
        type: "note",
        title: "Дүрэм: A は B です",
        text: "«A は B です» нь «A бол B» гэсэн утгатай. «は»-г «ва» гэж уншина. «です» нь өгүүлбэрийг эелдэг болгож төгсгөдөг.",
      },
      {
        type: "words",
        title: "Жишээ өгүүлбэр",
        items: [
          { jp: "わたしは バトです。", romaji: "Watashi wa Bato desu.", mn: "Би Бат." },
          { jp: "モンゴルじんです。", romaji: "Mongoru-jin desu.", mn: "Би монгол хүн." },
          { jp: "にじゅっさいです。", romaji: "Nijussai desu.", mn: "Би 20 настай." },
          { jp: "ウランバートルから きました。", romaji: "Uranbātoru kara kimashita.", mn: "Улаанбаатараас ирсэн." },
        ],
      },
    ],
    quiz: [
      { q: "«Би монгол хүн» гэж яаж хэлэх вэ?", options: ["モンゴルから きました。", "モンゴルじんです。", "わたしは にほんじんです。", "モンゴルです か。"], answer: 1 },
      { q: "«～から きました» гэдэг нь юу гэсэн үг вэ?", options: ["...-д очно", "...-аас ирсэн", "...-д амьдардаг", "...-г мэднэ"], answer: 1 },
      { q: "«A は B です» дахь «は»-г яаж уншдаг вэ?", options: ["ha", "wa", "a", "ga"], answer: 1 },
    ],
  },

  // ---------------- ДУНД ----------------
  {
    id: "dund-1",
    level: "dund",
    title: "Үйл үгийн て хэлбэр",
    minutes: 20,
    sections: [
      {
        type: "note",
        title: "Яагаад чухал вэ?",
        text: "て хэлбэр нь «～てください» (...-аарай), «～ています» (...-ж байна), «～てもいいですか» (...-ж болох уу) зэрэг олон хэллэгийн суурь болдог.",
      },
      {
        type: "words",
        title: "Үйл үг → て хэлбэр",
        items: [
          { jp: "たべる → たべて", romaji: "taberu → tabete", mn: "идэх" },
          { jp: "みる → みて", romaji: "miru → mite", mn: "харах" },
          { jp: "かく → かいて", romaji: "kaku → kaite", mn: "бичих" },
          { jp: "のむ → のんで", romaji: "nomu → nonde", mn: "уух" },
          { jp: "はなす → はなして", romaji: "hanasu → hanashite", mn: "ярих" },
          { jp: "まつ → まって", romaji: "matsu → matte", mn: "хүлээх" },
          { jp: "いく → いって", romaji: "iku → itte", mn: "явах (онцгой)" },
          { jp: "する → して", romaji: "suru → shite", mn: "хийх" },
          { jp: "くる → きて", romaji: "kuru → kite", mn: "ирэх" },
        ],
      },
    ],
    quiz: [
      { q: "«のむ» → て хэлбэр?", options: ["のみて", "のんで", "のって", "のいて"], answer: 1 },
      { q: "«いく» → て хэлбэр?", options: ["いいて", "いきて", "いって", "いんで"], answer: 2 },
      { q: "«かく» → て хэлбэр?", options: ["かいて", "かって", "かきて", "かんで"], answer: 0 },
      { q: "«まってください» гэдэг нь юу вэ?", options: ["Яваарай", "Хүлээгээрэй", "Хараарай", "Идээрэй"], answer: 1 },
    ],
  },
  {
    id: "dund-2",
    level: "dund",
    title: "Ажлын байрны хэллэг",
    minutes: 15,
    sections: [
      {
        type: "words",
        title: "Ажил дээр өдөр бүр хэрэглэнэ",
        items: [
          { jp: "おつかれさまです", romaji: "otsukaresama desu", mn: "Ажилласанд баярлалаа (ажлын мэндчилгээ)" },
          { jp: "しつれいします", romaji: "shitsurei shimasu", mn: "Уучлаарай, орж (гарч) байна" },
          { jp: "わかりました", romaji: "wakarimashita", mn: "Ойлголоо" },
          { jp: "もういちど おねがいします", romaji: "mō ichido onegaishimasu", mn: "Дахиад нэг хэлээч" },
          { jp: "すみません、わかりません", romaji: "sumimasen, wakarimasen", mn: "Уучлаарай, ойлгохгүй байна" },
          { jp: "やすんでも いいですか", romaji: "yasunde mo ii desu ka", mn: "Амарч болох уу?" },
          { jp: "きを つけます", romaji: "ki o tsukemasu", mn: "Болгоомжилно" },
        ],
      },
    ],
    quiz: [
      { q: "Ажлаа дуусгаад хамт ажиллагсдадаа юу гэх вэ?", options: ["おつかれさまです", "はじめまして", "こんばんは", "いただきます"], answer: 0 },
      { q: "Даргын зааврыг ойлгосон үедээ юу гэх вэ?", options: ["すみません", "わかりました", "しつれいします", "さようなら"], answer: 1 },
      { q: "Сайн сонсож чадаагүй бол юу гэж хэлэх вэ?", options: ["きを つけます", "もういちど おねがいします", "おつかれさまです", "わかりました"], answer: 1 },
      { q: "«～ても いいですか» нь юуг асуудаг вэ?", options: ["Зөвшөөрөл", "Цаг", "Үнэ", "Чиглэл"], answer: 0 },
    ],
  },
  {
    id: "dund-3",
    level: "dund",
    title: "Туршлага: ～たことがあります",
    minutes: 15,
    sections: [
      {
        type: "note",
        title: "Дүрэм",
        text: "Үйл үгийн た хэлбэр + «ことが あります» = «...-ж үзсэн». Ярилцлага дээр туршлагаа ярихад хэрэглэнэ. Үгүйсгэх нь «ことが ありません».",
      },
      {
        type: "words",
        title: "Жишээ өгүүлбэр",
        items: [
          { jp: "にほんへ いったことが あります。", romaji: "Nihon e itta koto ga arimasu.", mn: "Би Японд очиж үзсэн." },
          { jp: "こうじょうで はたらいたことが あります。", romaji: "Kōjō de hataraita koto ga arimasu.", mn: "Би үйлдвэрт ажиллаж үзсэн." },
          { jp: "すしを たべたことが ありません。", romaji: "Sushi o tabeta koto ga arimasen.", mn: "Би суши идэж үзээгүй." },
        ],
      },
    ],
    quiz: [
      { q: "«Би үйлдвэрт ажиллаж үзсэн» аль нь вэ?", options: ["こうじょうで はたらきます。", "こうじょうで はたらいたことが あります。", "こうじょうへ いきたいです。", "こうじょうで はたらいて ください。"], answer: 1 },
      { q: "«たべたことが ありません» гэдэг нь юу вэ?", options: ["Идэж үзээгүй", "Идмээр байна", "Идэж байна", "Идээрэй"], answer: 0 },
      { q: "«いく»-ийн た хэлбэр аль нь вэ?", options: ["いいた", "いきた", "いった", "いんだ"], answer: 2 },
    ],
  },

  // ---------------- АХИСАН ----------------
  {
    id: "ahisan-1",
    level: "ahisan",
    title: "Хүндэтгэлийн хэл (敬語)",
    minutes: 25,
    sections: [
      {
        type: "note",
        title: "Хоёр төрөл",
        text: "尊敬語 (сонкэйго) нь дарга, үйлчлүүлэгч зэрэг бусдын үйлдлийг өргөмжилдөг. 謙譲語 (кэнжёого) нь өөрийн үйлдлийг даруухан илэрхийлдэг. Японы ажлын байранд хоёуланг нь өдөр бүр сонсоно.",
      },
      {
        type: "words",
        title: "Хамгийн их хэрэглэгддэг үгс",
        items: [
          { jp: "いる・いく・くる → いらっしゃる", romaji: "irassharu", mn: "байх, явах, ирэх (尊敬語)" },
          { jp: "たべる・のむ → めしあがる", romaji: "meshiagaru", mn: "идэх, уух (尊敬語)" },
          { jp: "いう → おっしゃる", romaji: "ossharu", mn: "хэлэх (尊敬語)" },
          { jp: "みる → ごらんになる", romaji: "goran ni naru", mn: "харах (尊敬語)" },
          { jp: "いく・くる → まいる", romaji: "mairu", mn: "явах, ирэх (謙譲語)" },
          { jp: "たべる・もらう → いただく", romaji: "itadaku", mn: "идэх, авах (謙譲語)" },
          { jp: "いう → もうす", romaji: "mōsu", mn: "хэлэх (謙譲語)" },
          { jp: "する → いたす", romaji: "itasu", mn: "хийх (謙譲語)" },
        ],
      },
    ],
    quiz: [
      { q: "«Дарга ирлээ» гэдгийг хүндэтгэлтэй хэлбэл?", options: ["ぶちょうが まいりました。", "ぶちょうが いらっしゃいました。", "ぶちょうが きました よ。", "ぶちょうが いたしました。"], answer: 1 },
      { q: "Өөрийгөө танилцуулахдаа «いう»-г юугаар солих вэ?", options: ["おっしゃる", "もうす", "めしあがる", "ごらんになる"], answer: 1 },
      { q: "Үйлчлүүлэгчийн «идэх» үйлдлийг юу гэх вэ?", options: ["いただく", "めしあがる", "まいる", "いたす"], answer: 1 },
      { q: "«まいる» нь аль төрөлд хамаарах вэ?", options: ["尊敬語", "謙譲語"], answer: 1 },
    ],
  },
  {
    id: "ahisan-2",
    level: "ahisan",
    title: "Ажлын ярилцлагад бэлдэх",
    minutes: 20,
    sections: [
      {
        type: "words",
        title: "Ярилцлагын гол үгс",
        items: [
          { jp: "志望動機（しぼうどうき）", romaji: "shibō dōki", mn: "Сонгосон шалтгаан" },
          { jp: "長所（ちょうしょ）", romaji: "chōsho", mn: "Давуу тал" },
          { jp: "短所（たんしょ）", romaji: "tansho", mn: "Сул тал" },
          { jp: "経験（けいけん）", romaji: "keiken", mn: "Туршлага" },
          { jp: "一生懸命頑張ります", romaji: "isshōkenmei ganbarimasu", mn: "Чадах бүхнээ хийнэ" },
          { jp: "日本で技術を学びたいです", romaji: "Nihon de gijutsu o manabitai desu", mn: "Японд ур чадвар сурмаар байна" },
        ],
      },
      {
        type: "note",
        title: "Зөвлөгөө",
        text: "Ярилцлагад богино, тодорхой хариулт өг. Хаалгыг тогшоод «しつれいします» гэж орж, суухаасаа өмнө зөвшөөрөл хүлээ. Гарахдаа дахин «しつれいします» гэнэ.",
      },
    ],
    quiz: [
      { q: "«志望動機» гэж юуг асууж байна вэ?", options: ["Давуу тал", "Яагаад сонгосон", "Нас", "Гэр бүл"], answer: 1 },
      { q: "«長所は なんですか» гэвэл юуг хэлэх вэ?", options: ["Сул талаа", "Давуу талаа", "Хаягаа", "Цалингаа"], answer: 1 },
      { q: "Ярилцлагын өрөөнд орохдоо юу гэх вэ?", options: ["しつれいします", "おつかれさまです", "いただきます", "こんばんは"], answer: 0 },
    ],
  },
  {
    id: "ahisan-3",
    level: "ahisan",
    title: "～ようになる / ～ようにする",
    minutes: 20,
    sections: [
      {
        type: "note",
        title: "Ялгаа",
        text: "«～ようになる» нь өөрчлөлтийг илэрхийлнэ: «...чаддаг болсон». «～ようにする» нь хичээл зүтгэл, зуршлыг илэрхийлнэ: «...байхыг хичээх».",
      },
      {
        type: "words",
        title: "Жишээ өгүүлбэр",
        items: [
          { jp: "にほんごが はなせるようになりました。", romaji: "Nihongo ga hanaseru yō ni narimashita.", mn: "Япон хэлээр ярьж чаддаг болсон." },
          { jp: "まいにち べんきょうするようにしています。", romaji: "Mainichi benkyō suru yō ni shite imasu.", mn: "Өдөр бүр хичээллэхийг хичээж байна." },
          { jp: "じかんを まもるようにします。", romaji: "Jikan o mamoru yō ni shimasu.", mn: "Цагаа баримталж байхыг хичээнэ." },
        ],
      },
    ],
    quiz: [
      { q: "«Ярьж чаддаг болсон» аль нь вэ?", options: ["はなせるようになりました", "はなすようにします", "はなしたことがあります", "はなしてください"], answer: 0 },
      { q: "«～ようにしています» юуг илэрхийлэх вэ?", options: ["Байнга хичээж буй зуршил", "Өнгөрсөн туршлага", "Хүсэлт", "Зөвшөөрөл"], answer: 0 },
      { q: "«Цагаа баримталж байхыг хичээнэ» аль нь вэ?", options: ["じかんを まもるようになりました", "じかんを まもるようにします", "じかんを まもってください", "じかんを まもりたいです"], answer: 1 },
    ],
  },
];

export function lessonsFor(level: LevelId): Lesson[] {
  return LESSONS.filter((l) => l.level === level);
}

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
