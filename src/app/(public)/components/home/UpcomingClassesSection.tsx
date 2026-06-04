import Link from "next/link"
import { CalendarDays, Clock, MapPin, UsersRound } from "lucide-react"

export type UpcomingClass = {
  id: string
  name: string
  courseName: string
  startDate: string | null
  schedule: string
  branchName: string
  teacherName: string
  spotsLeft: number
}

const fallbackClasses: UpcomingClass[] = [
  {
    id: "communication-evening",
    name: "Giao tiếp cho người đi làm",
    courseName: "English Communication",
    startDate: null,
    schedule: "Tối Thứ 2 - Thứ 4 - Thứ 6",
    branchName: "Cơ sở gần bạn",
    teacherName: "Giáo viên RosyClass",
    spotsLeft: 6,
  },
  {
    id: "ielts-foundation",
    name: "IELTS Foundation",
    courseName: "IELTS",
    startDate: null,
    schedule: "Tối Thứ 3 - Thứ 5",
    branchName: "Online hoặc tại trung tâm",
    teacherName: "Giáo viên IELTS",
    spotsLeft: 8,
  },
  {
    id: "kids-starter",
    name: "Tiếng Anh trẻ em Starter",
    courseName: "Kids English",
    startDate: null,
    schedule: "Cuối tuần",
    branchName: "Lớp nhỏ",
    teacherName: "Giáo viên trẻ em",
    spotsLeft: 5,
  },
]

function formatStartDate(value: string | null) {
  if (!value) return "Đang nhận lịch tư vấn"

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value))
}

export function UpcomingClassesSection({ classes }: { classes: UpcomingClass[] }) {
  const visibleClasses = classes.length > 0 ? classes : fallbackClasses

  return (
    <section className="reveal-section bg-white py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-[14px] font-semibold uppercase tracking-[0.12em] text-[#008069]">
              Lớp sắp khai giảng
            </p>
            <h2 className="max-w-[620px] text-[34px] font-medium leading-[1.1] tracking-tight text-[#111b21] md:text-[48px]">
              Chọn lớp gần nhất, giữ chỗ trước khi đủ sĩ số.
            </h2>
          </div>
          <Link
            href="/lich-khai-giang"
            className="inline-flex items-center justify-center rounded-full border border-[#d8e0df] px-6 py-3 text-[15px] font-semibold text-[#111b21] transition-colors hover:border-[#25d366] hover:bg-[#25d366]"
          >
            Xem toàn bộ lịch
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {visibleClasses.map((classItem) => (
            <article
              key={classItem.id}
              className="rounded-[24px] border border-[#e9edef] bg-[#fcf5eb] p-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#008069]">
                    {classItem.courseName}
                  </p>
                  <h3 className="mt-2 text-[24px] font-semibold leading-tight text-[#111b21]">
                    {classItem.name}
                  </h3>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-[13px] font-semibold text-[#008069]">
                  Còn {classItem.spotsLeft} chỗ
                </span>
              </div>

              <dl className="space-y-4 text-[15px] text-[#54656f]">
                <div className="flex gap-3">
                  <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-[#25d366]" />
                  <div>
                    <dt className="font-medium text-[#111b21]">Khai giảng</dt>
                    <dd>{formatStartDate(classItem.startDate)}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#25d366]" />
                  <div>
                    <dt className="font-medium text-[#111b21]">Lịch học</dt>
                    <dd>{classItem.schedule}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#25d366]" />
                  <div>
                    <dt className="font-medium text-[#111b21]">Cơ sở</dt>
                    <dd>{classItem.branchName}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <UsersRound className="mt-0.5 h-5 w-5 shrink-0 text-[#25d366]" />
                  <div>
                    <dt className="font-medium text-[#111b21]">Giáo viên</dt>
                    <dd>{classItem.teacherName}</dd>
                  </div>
                </div>
              </dl>

              <Link
                href="/dang-ky"
                className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-[#111b21] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#25d366] hover:text-[#111b21]"
              >
                Giữ chỗ học thử
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
