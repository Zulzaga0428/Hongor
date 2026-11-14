import { COUNTRIES, isCountry, stageName } from "@/content/programs";
import { LEVELS, type LevelId } from "@/content/lessons";
import { listApplicants } from "@/server/applicant";
import { currentUser } from "@/server/auth";

/** Excel-д монгол үсэг зөв харагдахын тулд UTF-8 BOM-той CSV. */
function cell(v: unknown): string {
  let s = v === null || v === undefined ? "" : String(v);
  // Excel томьёо болж ажиллахаас сэргийлнэ (CSV injection).
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  const u = await currentUser();
  if (!u || u.role !== "admin") return new Response("Эрхгүй", { status: 403 });

  const rows = await listApplicants();
  const head = ["Овог", "Нэр", "Бүртгэлийн нэр", "Утас", "Улс", "Хөтөлбөр", "Ажлын чиглэл", "Төрсөн огноо", "Хүйс", "Өндөр", "Жин", "Боловсрол", "Хаяг", "Хэлний түвшин", "Шат", "Баримт", "Яаралтай үед", "Бүртгүүлсэн"];
  const lines = rows.map(({ user, a, stage, docs }) =>
    [
      a?.lastName,
      a?.firstName,
      user.name,
      user.phone,
      isCountry(a?.country) ? COUNTRIES[a.country].name : "",
      a?.program,
      a?.jobType,
      a?.birthDate,
      a?.gender,
      a?.heightCm,
      a?.weightKg,
      a?.education,
      a?.address,
      LEVELS[user.level as LevelId]?.jlpt,
      stageName(stage),
      `${docs.have}/${docs.need}`,
      a?.emergencyPhone ? `${a.emergencyName ?? ""} ${a.emergencyPhone}` : "",
      user.createdAt.toISOString().slice(0, 10),
    ]
      .map(cell)
      .join(","),
  );
  const csv = "﻿" + [head.map(cell).join(","), ...lines].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="hongor-turuu-${date}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
