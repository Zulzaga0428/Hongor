import { Back, Page } from "@/components/ui";
import { BRAND_THEME } from "@/components/theme";

export const metadata = { title: "Нууцлалын бодлого" };

export default function Privacy() {
  return (
    <div style={BRAND_THEME} className="min-h-dvh bg-[#f4f6f7]">
    <Page>
      <Back href="/" />
      <h1 className="text-2xl font-extrabold">Нууцлалын бодлого</h1>
      <div className="mt-5 grid grid-cols-1 gap-4 text-[15px] leading-relaxed">
        <section className="card p-5">
          <h2 className="mb-1 font-extrabold">Ямар мэдээлэл цуглуулдаг вэ</h2>
          <p>Утасны дугаар, нэр, анкетад бичсэн мэдээлэл (төрсөн огноо, боловсрол, туршлага г.м.), хуулсан бичиг баримтын зураг, хэлний сургалтын явц.</p>
        </section>
        <section className="card p-5">
          <h2 className="mb-1 font-extrabold">Юунд ашигладаг вэ</h2>
          <p>Зөвхөн таныг гадаадад ажилд зуучлах, хэлний сургалт явуулах зорилгоор. Таны зөвшөөрлөөр ажил олгогч байгууллагад дамжуулна. Бусад этгээдэд худалдахгүй, сурталчилгаанд ашиглахгүй.</p>
        </section>
        <section className="card p-5">
          <h2 className="mb-1 font-extrabold">Хэн хардаг вэ</h2>
          <p>Таны бичиг баримтыг зөвхөн та болон компанийн эрх бүхий ажилтан харна. Багш зөвхөн хэлний сургалтын явцыг харна.</p>
        </section>
        <section className="card p-5">
          <h2 className="mb-1 font-extrabold">Устгуулах эрх</h2>
          <p>Мэдээллээ засах, устгуулахыг хүсвэл компанийн ажилтанд хандана уу. Монгол Улсын Хувь хүний мэдээлэл хамгаалах тухай хуулийн дагуу хүсэлтийг шийдвэрлэнэ.</p>
        </section>
      </div>
    </Page>
    </div>
  );
}
