"use client"

import { useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { ArrowUp } from "lucide-react"
import { RosyMascot } from "@/components/kids"

// Chỉ đăng ký trên trình duyệt: ScrollTrigger chạy lúc render phía server sẽ làm hỏng trang trên Workers
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP)
}

const SPARKLE_COLORS = ["#ff5c93", "#ffc93c", "#3bb4f2", "#2ec4a0", "#8c5cf0", "#ff8a3d"]

/** "500+" → { from: 0, to: 500, render } ; khoảng như "3–11" hay chữ thì không đếm */
function parseCount(text: string) {
  const match = text.trim().match(/^([^\d]*)(\d[\d.,]*)([^\d]*)$/)
  if (!match) return null
  const [, prefix, digits, suffix] = match
  const value = Number(digits.replace(/[.,]/g, ""))
  if (!Number.isFinite(value) || value === 0) return null
  const grouped = /[.,]/.test(digits) || value >= 1000
  return {
    value,
    render: (current: number) => `${prefix}${grouped ? Math.round(current).toLocaleString("vi-VN") : Math.round(current)}${suffix}`,
  }
}

/**
 * Hiệu ứng cho trang công khai dựng bằng page builder. Phần hero đã có hiệu ứng CSS riêng
 * (hiện ngay từ lần vẽ đầu), ở đây lo phần cuộn trang và tương tác. Tắt hết khi người dùng
 * bật "giảm chuyển động".
 */
export function PageAnimations({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null)
  const progress = useRef<HTMLDivElement>(null)
  const [showTop, setShowTop] = useState(false)

  useGSAP(
    (_, contextSafe) => {
      const mm = gsap.matchMedia()

      // Nút "lên đầu trang" hiện cả khi giảm chuyển động
      ScrollTrigger.create({
        start: 700,
        end: "max",
        onToggle: (self) => setShowTop(self.isActive),
      })

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const sections = gsap.utils.toArray<HTMLElement>("section", root.current)

        // Thanh tiến độ đọc trang
        gsap.set(progress.current, { scaleX: 0, transformOrigin: "0 50%" })
        ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => gsap.set(progress.current, { scaleX: self.progress }),
        })

        for (const section of sections) {
          if (section.querySelector("h1")) {
            // Hero: ảnh nghiêng theo chuột (chỉ máy có chuột)
            const target = section.querySelector<HTMLElement>("[data-hero-parallax] > *")
            if (target && window.matchMedia("(pointer: fine)").matches) {
              const xTo = gsap.quickTo(target, "x", { duration: 0.8, ease: "power3" })
              const yTo = gsap.quickTo(target, "y", { duration: 0.8, ease: "power3" })
              const rTo = gsap.quickTo(target, "rotation", { duration: 0.8, ease: "power3" })
              const onMove = (event: PointerEvent) => {
                const rect = section.getBoundingClientRect()
                const dx = (event.clientX - rect.left) / rect.width - 0.5
                const dy = (event.clientY - rect.top) / rect.height - 0.5
                xTo(dx * 24)
                yTo(dy * 18)
                rTo(dx * 3)
              }
              const onLeave = () => {
                xTo(0)
                yTo(0)
                rTo(0)
              }
              section.addEventListener("pointermove", onMove)
              section.addEventListener("pointerleave", onLeave)
              return () => {
                section.removeEventListener("pointermove", onMove)
                section.removeEventListener("pointerleave", onLeave)
              }
            }
            continue
          }

          // Tiêu đề khối: huy hiệu, tiêu đề, mô tả bật lên lần lượt
          const heading = section.querySelector("h2")?.parentElement
          if (heading) {
            gsap.from(heading.children, {
              y: 36,
              autoAlpha: 0,
              duration: 0.7,
              stagger: 0.1,
              ease: "back.out(1.6)",
              scrollTrigger: { trigger: heading, start: "top 85%", once: true },
            })
          }

          // Thẻ trong lưới: nảy vào theo từng đợt khi cuộn tới
          const items = gsap.utils
            .toArray<HTMLElement>(":scope .grid > *, :scope dl > div, :scope details", section)
            .filter((item) => !heading?.contains(item))
          if (items.length) {
            gsap.set(items, { autoAlpha: 0, y: 60, scale: 0.92, rotation: () => gsap.utils.random(-4, 4) })
            ScrollTrigger.batch(items, {
              start: "top 88%",
              once: true,
              onEnter: (batch) =>
                gsap.to(batch, {
                  autoAlpha: 1,
                  y: 0,
                  scale: 1,
                  rotation: 0,
                  duration: 0.8,
                  stagger: 0.12,
                  ease: "back.out(1.7)",
                  // Trả lại góc nghiêng gốc (vd. -rotate-1) của thẻ sau khi chạy xong
                  clearProps: "transform",
                }),
            })
          }

          // Ảnh phóng nhẹ khi cuộn qua
          for (const image of section.querySelectorAll<HTMLImageElement>("img")) {
            gsap.fromTo(
              image,
              { scale: 1.12 },
              { scale: 1, ease: "none", scrollTrigger: { trigger: image, start: "top bottom", end: "bottom 40%", scrub: true } }
            )
          }

          // Hình trang trí (sao, mây...) trôi chậm hơn nội dung tạo chiều sâu.
          // Bỏ qua hình đang có hiệu ứng CSS (kid-float, kid-spin...) để không giành transform
          for (const deco of section.querySelectorAll<SVGElement>('svg[aria-hidden="true"]')) {
            const className = deco.getAttribute("class") ?? ""
            if (!className.includes("absolute") || /kid-(float|spin|wiggle)/.test(className)) continue
            gsap.fromTo(
              deco,
              { y: 50, rotation: -15 },
              { y: -50, rotation: 15, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1 } }
            )
          }
        }

        // Con số thống kê đếm tăng dần
        for (const element of gsap.utils.toArray<HTMLElement>("[data-count]", root.current)) {
          const parsed = parseCount(element.dataset.count ?? "")
          if (!parsed) continue
          const counter = { value: 0 }
          element.textContent = parsed.render(0)
          gsap.to(counter, {
            value: parsed.value,
            duration: 1.6,
            ease: "power2.out",
            scrollTrigger: { trigger: element, start: "top 90%", once: true },
            onUpdate: () => {
              element.textContent = parsed.render(counter.value)
            },
          })
        }

        // Bấm nút vui nhộn: bắn sao nhiều màu tại chỗ bấm
        const burst = contextSafe!((event: MouseEvent) => {
          const button = (event.target as HTMLElement).closest(".kid-pop")
          if (!button || !root.current?.contains(button)) return
          for (let i = 0; i < 10; i++) {
            const dot = document.createElement("span")
            dot.setAttribute("aria-hidden", "true")
            dot.textContent = i % 3 === 0 ? "★" : "●"
            Object.assign(dot.style, {
              position: "fixed",
              left: `${event.clientX}px`,
              top: `${event.clientY}px`,
              color: SPARKLE_COLORS[i % SPARKLE_COLORS.length],
              fontSize: `${gsap.utils.random(10, 20)}px`,
              pointerEvents: "none",
              zIndex: "1001",
            })
            document.body.appendChild(dot)
            const angle = (i / 10) * Math.PI * 2
            const distance = gsap.utils.random(40, 90)
            gsap.fromTo(
              dot,
              { xPercent: -50, yPercent: -50, scale: 0.4 },
              {
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                scale: 1,
                rotation: gsap.utils.random(-180, 180),
                autoAlpha: 0,
                duration: 0.8,
                ease: "power2.out",
                onComplete: () => dot.remove(),
              }
            )
          }
        })
        root.current?.addEventListener("click", burst)
        return () => root.current?.removeEventListener("click", burst)
      })
    },
    { scope: root }
  )

  const scrollToTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })
  }

  return (
    <div ref={root}>
      <div ref={progress} aria-hidden="true" className="fixed inset-x-0 top-0 z-[1000] h-1.5 bg-kid-rose" style={{ transform: "scaleX(0)" }} />
      {children}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Lên đầu trang"
        className={`kid-focus fixed right-4 bottom-4 z-[998] flex flex-col items-center transition-all duration-500 ${
          showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-24 opacity-0"
        }`}
      >
        <span className="kid-border kid-shadow-sm mb-1 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[13px] font-bold text-kid-ink">
          <ArrowUp className="h-4 w-4" /> Lên đầu trang
        </span>
        <RosyMascot mood="happy" className="kid-float h-16 w-16 @3xl:h-20 @3xl:w-20" />
      </button>
    </div>
  )
}
