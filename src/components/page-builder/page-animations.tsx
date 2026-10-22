"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { animate, backOut, inView, scroll } from "motion"
import { useReducedMotion } from "motion/react"
import { ArrowUp } from "lucide-react"
import { RosyMascot } from "@/components/kids"

const SPARKLE_COLORS = ["#ff5c93", "#ffc93c", "#3bb4f2", "#2ec4a0", "#8c5cf0", "#ff8a3d"]

const easeOutCubic = [0.33, 1, 0.68, 1] as const

const random = (min: number, max: number) => min + Math.random() * (max - min)

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
  const reduceMotion = useReducedMotion()

  // Nút "lên đầu trang" hiện cả khi giảm chuyển động
  useEffect(() => scroll((_, info) => setShowTop(info.y.current > 700)), [])

  // Layout effect để ẩn các khối sắp hiện trước lần vẽ đầu, tránh nháy
  useLayoutEffect(() => {
    const container = root.current
    if (reduceMotion || !container) return

    const cleanups: VoidFunction[] = []
    const touched = new Set<HTMLElement | SVGElement>()
    const hide = (element: HTMLElement, transform: string) => {
      touched.add(element)
      element.style.opacity = "0"
      element.style.transform = transform
    }
    const restore = (element: HTMLElement | SVGElement) => {
      element.style.removeProperty("opacity")
      element.style.removeProperty("transform")
    }
    // Gắn hiệu ứng vào thanh cuộn: tiến độ cuộn điều khiển thời gian của hiệu ứng
    const link = (controls: ReturnType<typeof animate>, options?: Parameters<typeof scroll>[1]) => {
      cleanups.push(scroll(controls, options), () => controls.stop())
    }
    const scrub = (element: HTMLElement | SVGElement, controls: ReturnType<typeof animate>, options: Parameters<typeof scroll>[1]) => {
      touched.add(element)
      link(controls, options)
    }

    // Thanh tiến độ đọc trang (giữ nguyên scaleX(0) của React khi dọn dẹp)
    if (progress.current) link(animate(progress.current, { scaleX: [0, 1] }, { ease: "linear" }))

    for (const section of container.querySelectorAll("section")) {
      if (section.querySelector("h1")) {
        // Hero: ảnh nghiêng theo chuột (chỉ máy có chuột)
        const target = section.querySelector<HTMLElement>("[data-hero-parallax] > *")
        if (target && window.matchMedia("(pointer: fine)").matches) {
          touched.add(target)
          // Lò xo giữ đà khi chuột đổi hướng liên tục
          const follow = { type: "spring", stiffness: 150, damping: 20 } as const
          const onMove = (event: PointerEvent) => {
            const rect = section.getBoundingClientRect()
            const dx = (event.clientX - rect.left) / rect.width - 0.5
            const dy = (event.clientY - rect.top) / rect.height - 0.5
            animate(target, { x: dx * 24, y: dy * 18, rotate: dx * 3 }, follow)
          }
          const onLeave = () => animate(target, { x: 0, y: 0, rotate: 0 }, follow)
          section.addEventListener("pointermove", onMove)
          section.addEventListener("pointerleave", onLeave)
          cleanups.push(() => {
            section.removeEventListener("pointermove", onMove)
            section.removeEventListener("pointerleave", onLeave)
          })
        }
        continue
      }

      // Tiêu đề khối: huy hiệu, tiêu đề, mô tả bật lên lần lượt
      const heading = section.querySelector("h2")?.parentElement
      if (heading) {
        const parts = Array.from(heading.children as HTMLCollectionOf<HTMLElement>)
        for (const part of parts) hide(part, "translateY(36px)")
        cleanups.push(
          inView(
            heading,
            () => {
              parts.forEach((part, i) =>
                animate(part, { opacity: [0, 1], y: [36, 0] }, { duration: 0.7, delay: i * 0.1, ease: backOut })
              )
            },
            { margin: "0px 0px -15% 0px" }
          )
        )
      }

      // Thẻ trong lưới: nảy vào theo từng đợt khi cuộn tới
      const items = Array.from(
        section.querySelectorAll<HTMLElement>(":scope .grid > *, :scope dl > div, :scope details")
      ).filter((item) => !heading?.contains(item))
      if (items.length) {
        const tilts = new Map(items.map((item) => [item, random(-4, 4)]))
        for (const item of items) hide(item, `translateY(60px) scale(0.92) rotate(${tilts.get(item)}deg)`)

        // Các thẻ vào khung nhìn cùng lượt được gom lại để chạy so le
        let batch: HTMLElement[] = []
        const flush = () => {
          batch.forEach((item, i) =>
            animate(
              item,
              { opacity: [0, 1], y: [60, 0], scale: [0.92, 1], rotate: [tilts.get(item)!, 0] },
              { duration: 0.8, delay: i * 0.12, ease: backOut }
            )
              // Trả lại góc nghiêng gốc (vd. -rotate-1) của thẻ sau khi chạy xong
              .then(() => restore(item))
          )
          batch = []
        }
        cleanups.push(
          inView(
            items,
            (item) => {
              if (!batch.length) queueMicrotask(flush)
              batch.push(item as HTMLElement)
            },
            { margin: "0px 0px -12% 0px" }
          )
        )
      }

      // Ảnh phóng nhẹ khi cuộn qua
      for (const image of section.querySelectorAll("img")) {
        scrub(image, animate(image, { scale: [1.12, 1] }, { ease: "linear" }), {
          target: image,
          offset: ["start end", "end 0.4"],
        })
      }

      // Hình trang trí (sao, mây...) trôi chậm hơn nội dung tạo chiều sâu.
      // Bỏ qua hình đang có hiệu ứng CSS (kid-float, kid-spin...) để không giành transform
      for (const deco of section.querySelectorAll<SVGElement>('svg[aria-hidden="true"]')) {
        const className = deco.getAttribute("class") ?? ""
        if (!className.includes("absolute") || /kid-(float|spin|wiggle)/.test(className)) continue
        scrub(deco, animate(deco, { y: [50, -50], rotate: [-15, 15] }, { ease: "linear" }), {
          target: section,
          offset: ["start end", "end start"],
        })
      }
    }

    // Con số thống kê đếm tăng dần
    for (const element of container.querySelectorAll<HTMLElement>("[data-count]")) {
      const parsed = parseCount(element.dataset.count ?? "")
      if (!parsed) continue
      element.textContent = parsed.render(0)
      cleanups.push(
        inView(
          element,
          () => {
            animate(0, parsed.value, {
              duration: 1.6,
              ease: easeOutCubic,
              onUpdate: (value) => {
                element.textContent = parsed.render(value)
              },
            })
          },
          { margin: "0px 0px -10% 0px" }
        )
      )
    }

    // Bấm nút vui nhộn: bắn sao nhiều màu tại chỗ bấm
    const burst = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".kid-pop")) return
      for (let i = 0; i < 10; i++) {
        const dot = document.createElement("span")
        dot.setAttribute("aria-hidden", "true")
        dot.textContent = i % 3 === 0 ? "★" : "●"
        Object.assign(dot.style, {
          position: "fixed",
          left: `${event.clientX}px`,
          top: `${event.clientY}px`,
          translate: "-50% -50%",
          color: SPARKLE_COLORS[i % SPARKLE_COLORS.length],
          fontSize: `${random(10, 20)}px`,
          pointerEvents: "none",
          zIndex: "1001",
        })
        document.body.appendChild(dot)
        const angle = (i / 10) * Math.PI * 2
        const distance = random(40, 90)
        animate(
          dot,
          {
            x: [0, Math.cos(angle) * distance],
            y: [0, Math.sin(angle) * distance],
            scale: [0.4, 1],
            rotate: [0, random(-180, 180)],
            opacity: [1, 0],
          },
          { duration: 0.8, ease: easeOutCubic }
        ).then(() => dot.remove())
      }
    }
    container.addEventListener("click", burst)
    cleanups.push(() => container.removeEventListener("click", burst))

    return () => {
      for (const cleanup of cleanups) cleanup()
      touched.forEach(restore)
    }
  }, [reduceMotion])

  const scrollToTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })
  }

  return (
    <div ref={root}>
      <div ref={progress} aria-hidden="true" className="fixed inset-x-0 top-0 z-[1000] h-1.5 origin-left bg-kid-rose" style={{ transform: "scaleX(0)" }} />
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
