import { Building2, Database, Eye, Lock, ShieldCheck, UserCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { PageHero, readableSolid, toneAt } from "@/components/kids"
import { getSiteSettings } from "@/lib/get-site-settings"

const sections = [
  { id: "thu-thap", Icon: Database, title: "1. Thu thập thông tin" },
  { id: "su-dung", Icon: Eye, title: "2. Sử dụng thông tin" },
  { id: "bao-mat", Icon: Lock, title: "3. Bảo mật thông tin" },
  { id: "quyen", Icon: UserCheck, title: "4. Quyền của phụ huynh" },
  { id: "don-vi", Icon: Building2, title: "5. Đơn vị chủ quản" },
]

function SectionTitle({ index }: { index: number }) {
  const section = sections[index]
  return (
    <h2 id={section.id} className="flex scroll-mt-28 items-center gap-3">
      <span
        aria-hidden="true"
        className={cn("kid-border-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", readableSolid(toneAt(index)))}
      >
        <section.Icon className="h-5 w-5" strokeWidth={2.5} />
      </span>
      {section.title}
    </h2>
  )
}

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings()

  return (
    <div className="flex min-h-screen w-full flex-col pb-24">
      <PageHero
        tone="mint"
        eyebrow="Thông tin pháp lý"
        eyebrowIcon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />}
        title="Chính sách bảo mật"
        highlight="bảo mật"
        description="RosyClass cam kết bảo vệ thông tin cá nhân của ba mẹ và các bé một cách an toàn, minh bạch."
      />

      <section className="pt-8 md:pt-12">
        <div className="mx-auto grid max-w-[1040px] gap-8 px-4 sm:px-8 lg:grid-cols-[240px_1fr]">
          <nav aria-label="Mục lục" className="lg:sticky lg:top-28 lg:self-start">
            <ul className="kid-border kid-shadow-sm flex flex-wrap gap-2 rounded-kid bg-kid-sun-soft p-4 lg:flex-col">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="kid-focus block rounded-xl px-3 py-2 text-[15px] font-bold text-kid-ink transition-colors hover:bg-white"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <article className="kid-border kid-shadow rounded-kid-lg bg-white px-5 py-8 sm:px-8 md:px-12 md:py-12">
            <div className="kid-prose kid-prose-icons">
              <SectionTitle index={0} />
              <p>
                RosyClass thu thập các thông tin cơ bản như họ tên của bé, họ tên và số điện thoại, email của phụ huynh khi ba mẹ đăng ký nhận tư vấn, cho bé làm bài kiểm tra trình độ hoặc tham gia khóa học tại trung tâm.
                Các thông tin này chỉ được sử dụng cho mục đích liên hệ và cải thiện chất lượng dịch vụ.
              </p>

              <SectionTitle index={1} />
              <p>
                Thông tin của ba mẹ và bé được sử dụng để:
              </p>
              <ul>
                <li>Sắp xếp lịch học và lớp học phù hợp với độ tuổi của bé.</li>
                <li>Cung cấp tài liệu và thông tin liên quan đến khóa học.</li>
                <li>Gửi tới ba mẹ các thông báo về lịch học, học phí, tình hình học tập của bé và các sự kiện tại trung tâm.</li>
              </ul>

              <SectionTitle index={2} />
              <p>
                Chúng tôi cam kết không bán, chia sẻ hay trao đổi thông tin cá nhân của phụ huynh và các bé cho bất kỳ bên thứ ba nào, ngoại trừ các trường hợp theo yêu cầu của pháp luật. Dữ liệu được lưu trữ trên hệ thống máy chủ có bảo mật.
              </p>

              <SectionTitle index={3} />
              <p>
                Ba mẹ có quyền yêu cầu xem, chỉnh sửa hoặc xóa thông tin cá nhân của mình và của bé khỏi hệ thống của RosyClass bất cứ lúc nào bằng cách liên hệ với bộ phận hỗ trợ của chúng tôi qua email:{" "}
                <a href={`mailto:${settings.email}`}>{settings.email}</a>.
              </p>
            </div>

            <div>
              <SectionTitle index={4} />
              <ul>
                {settings.legalName ? <li>Tên đăng ký: {settings.legalName}</li> : null}
                {settings.taxCode ? <li>Mã số thuế: {settings.taxCode}</li> : null}
                {settings.legalRepresentative ? <li>Người đại diện: {settings.legalRepresentative}</li> : null}
                {settings.address ? <li>Địa chỉ: {settings.address}</li> : null}
                {settings.phone ? <li>Điện thoại: {settings.phone}</li> : null}
              </ul>
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}
