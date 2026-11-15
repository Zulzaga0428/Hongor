import { getApplicant } from "@/server/applicant";
import { requireStudent } from "@/server/auth";
import { Back } from "@/components/ui";
import { AnketForm } from "@/components/anket-form";

export default async function Anket() {
  const u = await requireStudent();
  const a = await getApplicant(u.id);
  return (
    <>
      <Back href="/material" label="Миний материал" />
      <h1 className="text-2xl font-bold lg:text-[28px]">Анкет</h1>
      <p className="mb-5 mt-1 text-sm text-muted">Үнэн зөв бөглөнө үү — Япон компанид энэ мэдээлэл очно.</p>
      <AnketForm
        initial={{
          country: a.country ?? "",
          program: a.program ?? "",
          jobType: a.jobType ?? "",
          lastName: a.lastName ?? "",
          firstName: a.firstName ?? "",
          birthDate: a.birthDate ?? "",
          gender: a.gender ?? "",
          address: a.address ?? "",
          education: a.education ?? "",
          experience: a.experience ?? "",
          heightCm: a.heightCm ? String(a.heightCm) : "",
          weightKg: a.weightKg ? String(a.weightKg) : "",
          emergencyName: a.emergencyName ?? "",
          emergencyPhone: a.emergencyPhone ?? "",
        }}
        consented={!!a.consentAt}
        submitted={!!a.submittedAt}
      />
    </>
  );
}
