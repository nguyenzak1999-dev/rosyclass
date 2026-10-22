import Link from "next/link"
import { LogOut, Phone } from "lucide-react"
import { KidCard, RosyMascot } from "@/components/kids"
import { getSiteSettings } from "@/lib/get-site-settings"
import { logoutParent } from "../actions"

/** Thanh đầu trang cổng phụ huynh: lời chào + nút đăng xuất */
export function PortalHeader({ parentName, backHref, backLabel }: { parentName: string; backHref?: string; backLabel?: string }) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3">
      {backHref ? (
        <Link
          href={backHref}
          className="kid-border kid-focus inline-flex min-h-11 items-center rounded-full bg-white px-4 text-sm font-bold"
        >
          ← {backLabel ?? "Quay lại"}
        </Link>
      ) : (
        <p className="min-w-0 flex-1 text-[15px] text-kid-ink-soft">
          Xin chào <span className="font-bold text-kid-ink">{parentName}</span> 👋
        </p>
      )}
      <form action={logoutParent} className="ml-auto">
        <button
          type="submit"
          className="kid-focus inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 border-kid-ink bg-white px-4 text-sm font-bold"
        >
          <LogOut className="h-4 w-4" /> Đăng xuất
        </button>
      </form>
    </div>
  )
}

/** Trang thân thiện khi chưa đăng nhập, link hết hạn/bị thu hồi hoặc vừa đăng xuất */
export async function NeedLinkCard({ reason }: { reason: "invalid" | "signed-out" | "missing" }) {
  const settings = await getSiteSettings()
  const title =
    reason === "signed-out" ? "Ba mẹ đã đăng xuất" : reason === "invalid" ? "Link này không còn dùng được" : "Chào ba mẹ!"
  const body =
    reason === "signed-out"
      ? "Khi cần xem lại, ba mẹ chỉ cần bấm vào link trung tâm đã gửi qua Zalo."
      : reason === "invalid"
        ? "Link có thể đã hết hạn hoặc trung tâm đã cấp link mới. Ba mẹ nhắn trung tâm để nhận link mới nhé."
        : "Ba mẹ hãy mở cổng phụ huynh bằng link riêng trung tâm đã gửi qua Zalo hoặc tin nhắn. Chưa có link thì nhắn trung tâm nhé."

  return (
    <KidCard className="mx-auto mt-6 flex max-w-xl flex-col items-center gap-4 text-center">
      <RosyMascot mood={reason === "invalid" ? "think" : "happy"} className="h-28 w-28" />
      <h1 className="text-[28px] leading-tight font-extrabold">{title}</h1>
      <p className="text-[17px] leading-relaxed text-kid-ink-soft">{body}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {settings.phone ? (
          <a
            href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
            className="kid-border kid-shadow-sm kid-pop kid-focus inline-flex min-h-12 items-center gap-2 rounded-full bg-kid-sun px-6 font-bold"
          >
            <Phone className="h-4 w-4" /> {settings.phone}
          </a>
        ) : null}
        {settings.zalo ? (
          <a
            href={settings.zalo}
            target="_blank"
            rel="noreferrer"
            className="kid-border kid-shadow-sm kid-pop kid-focus inline-flex min-h-12 items-center gap-2 rounded-full bg-kid-sky px-6 font-bold"
          >
            Nhắn Zalo trung tâm
          </a>
        ) : null}
      </div>
    </KidCard>
  )
}
