import { deleteDoc } from "@/app/material-actions";
import { DOC_KINDS } from "@/content/programs";
import { docsOf } from "@/server/applicant";
import { requireStudent } from "@/server/auth";
import { Back, Badge } from "@/components/ui";
import { DocUpload } from "@/components/doc-upload";

export default async function Barimt() {
  const u = await requireStudent();
  const docs = await docsOf(u.id);

  return (
    <>
      <Back href="/material" label="Миний материал" />
      <h1 className="text-2xl font-bold lg:text-[28px]">Бичиг баримт</h1>
      <p className="mb-5 mt-1 text-sm text-muted">Утсаараа зураг аваад хуулна. Бүх үсэг тод харагдаж байх ёстой.</p>

      <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
        {DOC_KINDS.map((k) => {
          const mine = docs.filter((d) => d.kind === k.id);
          const top = mine[0];
          return (
            <li key={k.id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold">{k.name}</span>
                    {k.required && !top && <Badge tone="gold">Заавал</Badge>}
                    {top?.status === "ok" && <Badge tone="green">✓ Батлагдсан</Badge>}
                    {top?.status === "pending" && <Badge tone="gray">Шалгуулж байна</Badge>}
                    {top?.status === "rejected" && <Badge tone="pink">Дахин илгээх</Badge>}
                  </div>
                  <p className="text-xs text-muted">{k.hint}</p>
                  {top?.status === "rejected" && top.note && <p className="mt-1 text-xs font-bold text-danger">Шалтгаан: {top.note}</p>}
                </div>
                {(k.id === "other" || top?.status !== "ok") && <DocUpload kind={k.id} label={top && k.id !== "other" ? "Солих" : "Хуулах"} />}
              </div>

              {mine.length > 0 && (
                <ul className="mt-3 grid grid-cols-1 gap-2">
                  {mine.map((d) => (
                    <li key={d.id} className="flex items-center gap-3 rounded-xl bg-bg p-2">
                      <a href={`/api/barimt/${d.id}`} target="_blank" rel="noreferrer" className="shrink-0">
                        {d.mime.startsWith("image/") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`/api/barimt/${d.id}`} alt={k.name} className="h-12 w-12 rounded-lg object-cover" />
                        ) : (
                          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink text-xs font-extrabold text-red">PDF</span>
                        )}
                      </a>
                      <div className="min-w-0 flex-1 text-xs">
                        <div className="truncate font-bold">{d.filename}</div>
                        <div className="text-muted">{Math.round(d.size / 1024)} KB</div>
                      </div>
                      {d.status !== "ok" && (
                        <form action={deleteDoc}>
                          <input type="hidden" name="id" value={d.id} />
                          <button className="px-2 text-xs font-bold text-muted underline">Устгах</button>
                        </form>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
