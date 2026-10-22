import Link from "next/link"
import { CalendarDays, Clock, MapPin, Quote, UserRound } from "lucide-react"
import { KidBadge, KidButton, toneAt, toneClasses } from "@/components/kids"
import { cn } from "@/lib/utils"
import type { BlockProps } from "@/lib/page-builder/registry"
import {
  BlockImage,
  BlockSection,
  Container,
  EmptyState,
  HeadingRow,
  initials,
  type BlockComponentProps,
} from "./shared"
import { courseLevelLabel } from "@/lib/course-levels"

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
})

function formatDate(value: string | null) {
  if (!value) return "Đang cập nhật"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "Đang cập nhật" : dateFormatter.format(date)
}

// ---------------------------------------------------------------------------
// Khoá học nổi bật
// ---------------------------------------------------------------------------

export function FeaturedCoursesBlock({ props, ctx }: BlockComponentProps<BlockProps<"featuredCourses">>) {
  const courses = (ctx.data.courses ?? []).slice(0, props.limit)

  return (
    <BlockSection background={props.background} anchor={props.anchor}>
      <Container>
        <HeadingRow
          eyebrow={props.eyebrow}
          title={props.title}
          highlight={props.highlight}
          description={props.subtitle}
          buttonText={props.buttonText}
          buttonLink={props.buttonLink}
          tone="sky"
        />
        {courses.length === 0 ? (
          <EmptyState
            mode={ctx.mode}
            title="Khoá học đang được cập nhật"
            description="Ba mẹ vui lòng quay lại sau hoặc liên hệ để được tư vấn nhé!"
            editorHint="Khối này tự lấy các khoá học đã xuất bản trong mục Khoá học"
          />
        ) : (
          <div className="grid gap-6 @xl:grid-cols-2 @5xl:grid-cols-3">
            {courses.map((course, index) => {
              const tone = toneAt(index)
              return (
                <Link
                  key={course.id}
                  href={`/khoa-hoc/${course.slug}`}
                  className="kid-border kid-shadow kid-pop group flex flex-col overflow-hidden rounded-kid bg-white focus-visible:ring-4 focus-visible:ring-kid-sun/60 focus-visible:outline-none"
                >
                  <div className="relative border-b-[3px] border-kid-ink">
                    <BlockImage src={course.thumbnail} alt={course.name} tone={tone} className="aspect-[16/10] w-full" />
                    <KidBadge tone={tone} className="absolute top-3 left-3 text-[13px]">
                      {courseLevelLabel(course.level)}
                    </KidBadge>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <h3 className="text-[22px] leading-tight font-extrabold">{course.name}</h3>
                    {course.targetAudience ? (
                      <p className="text-[14px] font-bold text-kid-ink-soft">Dành cho: {course.targetAudience}</p>
                    ) : null}
                    {course.description ? (
                      <p className="line-clamp-3 text-[15px] leading-relaxed text-kid-ink-soft">{course.description}</p>
                    ) : null}
                    <span
                      className={cn(
                        "mt-auto inline-flex w-fit items-center gap-1 rounded-full px-4 py-1.5 font-kid-display text-[15px] font-bold",
                        toneClasses[tone].soft
                      )}
                    >
                      Xem chi tiết →
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </Container>
    </BlockSection>
  )
}

// ---------------------------------------------------------------------------
// Lớp sắp khai giảng
// ---------------------------------------------------------------------------

export function UpcomingClassesBlock({ props, ctx }: BlockComponentProps<BlockProps<"upcomingClasses">>) {
  const classes = (ctx.data.upcomingClasses ?? []).slice(0, props.limit)

  return (
    <BlockSection background={props.background} anchor={props.anchor}>
      <Container>
        <HeadingRow
          eyebrow={props.eyebrow}
          title={props.title}
          highlight={props.highlight}
          description={props.description}
          buttonText={props.buttonText}
          buttonLink={props.buttonLink}
          tone="orange"
        />
        {classes.length === 0 ? (
          <EmptyState
            mode={ctx.mode}
            title="Lịch khai giảng đang được cập nhật"
            description="Để lại thông tin, RosyClass sẽ báo ba mẹ ngay khi có lớp mới."
            editorHint="Khối này tự lấy các lớp có trạng thái Sắp khai giảng"
            action={<KidButton href="/dang-ky" tone="orange" size="sm">Đăng ký nhận lịch</KidButton>}
          />
        ) : (
          <div className="grid gap-6 @xl:grid-cols-2 @5xl:grid-cols-3">
            {classes.map((item, index) => {
              const tone = toneAt(index + 1)
              return (
                <article key={item.id} className="kid-border kid-shadow flex flex-col gap-4 rounded-kid bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <KidBadge tone={tone} className="text-[13px]">
                      {item.courseName}
                    </KidBadge>
                    <span className="rounded-full bg-kid-cream px-3 py-1 text-[13px] font-bold text-kid-ink">
                      {item.spotsLeft > 0 ? `Còn ${item.spotsLeft} chỗ` : "Đã đủ chỗ"}
                    </span>
                  </div>
                  <h3 className="text-[22px] leading-tight font-extrabold">{item.name}</h3>
                  <dl className="grid gap-2.5 text-[15px]">
                    <InfoRow icon={CalendarDays} label="Khai giảng" value={formatDate(item.startDate)} />
                    <InfoRow icon={Clock} label="Lịch học" value={item.schedule} />
                    <InfoRow icon={MapPin} label="Cơ sở" value={item.branchName} />
                    <InfoRow icon={UserRound} label="Giáo viên" value={item.teacherName} />
                  </dl>
                  <div className="mt-auto pt-2">
                    <KidButton href="/dang-ky" tone={tone} size="sm" className="w-full">
                      Giữ chỗ cho bé
                    </KidButton>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </Container>
    </BlockSection>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-kid-ink" aria-hidden="true" />
      <dt className="shrink-0 font-bold text-kid-ink">{label}:</dt>
      <dd className="text-kid-ink-soft">{value}</dd>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Giáo viên nổi bật
// ---------------------------------------------------------------------------

export function FeaturedTeachersBlock({ props, ctx }: BlockComponentProps<BlockProps<"featuredTeachers">>) {
  const teachers = (ctx.data.teachers ?? []).slice(0, props.limit)

  return (
    <BlockSection background={props.background} anchor={props.anchor}>
      <Container>
        <HeadingRow
          eyebrow={props.eyebrow}
          title={props.title}
          highlight={props.highlight}
          description={props.description}
          buttonText={props.buttonText}
          buttonLink={props.buttonLink}
          tone="grape"
        />
        {teachers.length === 0 ? (
          <EmptyState
            mode={ctx.mode}
            title="Đội ngũ giáo viên đang được cập nhật"
            editorHint="Bật “Hiển thị trên trang chủ” cho giáo viên trong mục Giáo viên"
          />
        ) : (
          <div className="grid gap-6 @xl:grid-cols-2 @5xl:grid-cols-3">
            {teachers.map((teacher, index) => {
              const tone = toneAt(index + 2)
              return (
                <Link
                  key={teacher.id}
                  href={`/giao-vien/${teacher.id}`}
                  className="kid-border kid-shadow kid-pop flex flex-col items-center gap-3 rounded-kid bg-white p-6 text-center focus-visible:ring-4 focus-visible:ring-kid-sun/60 focus-visible:outline-none"
                >
                  <div className={cn("kid-border relative h-28 w-28 overflow-hidden rounded-full", toneClasses[tone].soft)}>
                    {teacher.avatar ? (
                      <BlockImage src={teacher.avatar} alt={teacher.fullName} className="h-full w-full" />
                    ) : (
                      <span
                        className="flex h-full w-full items-center justify-center font-kid-display text-[34px] font-extrabold"
                        aria-hidden="true"
                      >
                        {initials(teacher.fullName)}
                      </span>
                    )}
                  </div>
                  <h3 className="text-[22px] leading-tight font-extrabold">{teacher.fullName}</h3>
                  {teacher.specialties ? (
                    <KidBadge tone={tone} className="text-[13px]">
                      {teacher.specialties.split(/[,;\n]/)[0]?.trim()}
                    </KidBadge>
                  ) : null}
                  {teacher.bio ? (
                    <p className="line-clamp-3 text-[15px] leading-relaxed text-kid-ink-soft">{teacher.bio}</p>
                  ) : null}
                </Link>
              )
            })}
          </div>
        )}
      </Container>
    </BlockSection>
  )
}

// ---------------------------------------------------------------------------
// Cảm nhận
// ---------------------------------------------------------------------------

export function TestimonialsBlock({ props, ctx }: BlockComponentProps<BlockProps<"testimonials">>) {
  const items =
    props.source === "db"
      ? (ctx.data.testimonials ?? []).slice(0, props.limit).map((item) => ({
          key: item.id,
          avatar: item.avatar,
          name: item.name,
          role: item.title,
          content: item.content,
        }))
      : props.items
          .filter((item) => item.content)
          .map((item, index) => ({ key: String(index), avatar: item.avatar, name: item.name, role: item.role, content: item.content }))

  // Trang công khai: không có cảm nhận thì ẩn khối (giống trang chủ cũ)
  if (items.length === 0 && ctx.mode === "public") return null

  return (
    <BlockSection background={props.background} anchor={props.anchor}>
      <Container>
        <HeadingRow eyebrow={props.eyebrow} title={props.title} highlight={props.highlight} tone="rose" />
        {items.length === 0 ? (
          <EmptyState
            mode={ctx.mode}
            title="Chưa có cảm nhận nào"
            editorHint={
              props.source === "db"
                ? "Khối lấy cảm nhận đã xuất bản trong mục Cảm nhận học viên. Khi trống, khối sẽ ẩn trên trang thật."
                : "Thêm cảm nhận trong bảng thuộc tính"
            }
          />
        ) : (
          <div className="grid gap-6 @3xl:grid-cols-2 @5xl:grid-cols-3">
            {items.map((item, index) => {
              const tone = toneAt(index)
              return (
                <figure key={item.key} className="flex flex-col gap-4">
                  <blockquote
                    className={cn(
                      "kid-border kid-shadow relative rounded-kid p-6 text-[16px] leading-relaxed text-kid-ink",
                      toneClasses[tone].soft,
                      index % 2 === 0 ? "-rotate-1" : "rotate-1"
                    )}
                  >
                    <Quote className="mb-2 h-7 w-7 opacity-70" aria-hidden="true" />
                    <p className="whitespace-pre-line">{item.content}</p>
                    <span
                      className={cn("absolute -bottom-[15px] left-10 h-6 w-6 rotate-45 border-r-[3px] border-b-[3px] border-kid-ink", toneClasses[tone].soft)}
                      aria-hidden="true"
                    />
                  </blockquote>
                  <figcaption className="flex items-center gap-3 pt-2 pl-4">
                    <span className={cn("kid-border h-12 w-12 shrink-0 overflow-hidden rounded-full", toneClasses[tone].solid)}>
                      {item.avatar ? (
                        <BlockImage src={item.avatar} alt="" className="h-full w-full" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center font-kid-display font-extrabold" aria-hidden="true">
                          {initials(item.name)}
                        </span>
                      )}
                    </span>
                    <span className="flex flex-col">
                      <span className="font-kid-display text-[17px] font-bold">{item.name}</span>
                      {item.role ? <span className="text-[14px] text-kid-ink-soft">{item.role}</span> : null}
                    </span>
                  </figcaption>
                </figure>
              )
            })}
          </div>
        )}
      </Container>
    </BlockSection>
  )
}
