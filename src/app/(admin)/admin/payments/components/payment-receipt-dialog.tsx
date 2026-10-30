"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Printer, QrCode, CreditCard, User, BookOpen, Clock, FileText, Send, Mail } from "lucide-react"
import { toast } from "sonner"
import { VIETNAM_TIME_ZONE } from "@/lib/curriculum"
import { parseBillingSummary, type BillingSummary, type FamilyNotice } from "@/lib/monthly-billing-shared"
import { BillingSummaryView, familyRemaining } from "./billing-summary-view"
import { billingSummaryHtml, billingSummaryText } from "./billing-summary-print"
import { FamilyNoticeView } from "./family-notice-view"
import { getFamilyNotice } from "../monthly-actions"

interface PaymentReceiptDialogProps {
  payment: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
  siteSettings?: any
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(value)
}

function formatDate(value: any) {
  if (!value) return "—"
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: VIETNAM_TIME_ZONE,
  }).format(new Date(value))
}

const paymentMethodLabels: Record<string, string> = {
  CASH: "Tiền mặt",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
  CARD: "Quẹt thẻ",
  OTHER: "Khác"
}

const paymentCategoryLabels: Record<string, string> = {
  TUITION: "Học phí",
  FOREIGN: "Buổi GV nước ngoài",
  CARRY: "Thừa/thiếu tháng trước",
  MATERIAL: "Giáo trình/Tài liệu",
  TEST: "Lệ phí thi",
  MAKE_UP: "Học bù",
  DISCOUNT: "Chiết khấu/Ưu đãi",
  OTHER: "Khác"
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function removeDiacritics(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase();
}

export function PaymentReceiptDialog({ payment, open, onOpenChange, siteSettings }: PaymentReceiptDialogProps) {
  const [zaloSending, setZaloSending] = React.useState(false)
  const [emailSending, setEmailSending] = React.useState(false)
  // Phiếu thu tháng: thông báo cả nhà (mỗi bé một cột) đọc mới mỗi lần mở
  const [noticeState, setNoticeState] = React.useState<{ id: string; notice?: FamilyNotice; error?: string } | null>(null)
  const paymentId: string | undefined = payment?.id
  const isMonthly = Boolean(payment?.billingMonth)

  React.useEffect(() => {
    if (!open || !paymentId || !isMonthly) return
    let cancelled = false
    getFamilyNotice(paymentId).then((result) => {
      if (cancelled) return
      setNoticeState(result.success ? { id: paymentId, notice: result.data } : { id: paymentId, error: result.error })
    })
    return () => {
      cancelled = true
    }
  }, [open, paymentId, isMonthly])

  if (!payment) return null
  const notice = noticeState?.id === payment.id ? noticeState : null
  // Thông báo tháng chưa tải xong thì chưa có gì để in / chụp gửi phụ huynh
  const contentReady = !isMonthly || Boolean(notice?.notice)

  const displayCode = payment.receiptCode || `PT-${payment.id.slice(0, 8).toUpperCase()}`

  const getTransferContent = () => {
    if (payment.student?.code) {
      const cleanName = payment.student.fullName ? removeDiacritics(payment.student.fullName) : ""
      return `ROSY ${payment.student.code} ${cleanName}`.trim()
    }
    return `ROSY ${payment.receiptCode || payment.id.slice(0, 8)}`
  }

  // Dynamic VietQR generator fallback
  const getQrUrl = () => {
    const url = buildQrUrl()
    // img.vietqr.io chuyển .png/.jpg sang .svg bằng 301 không kèm CORS: trình duyệt chặn khi chụp ảnh biên lai
    return url ? url.replace(/(img\.vietqr\.io\/image\/[^?]+)\.(png|jpg)(?=\?|$)/, "$1.svg") : null
  }

  const buildQrUrl = () => {
    // If we have an existing qrPayload (which is a valid VietQR URL from DB), 
    // try to just update its amount to the current remaining amount
    if (payment.qrPayload && payment.qrPayload.startsWith("http")) {
      try {
        const url = new URL(payment.qrPayload)
        const amount = payment.remainingAmount > 0 ? payment.remainingAmount : payment.totalAmount
        url.searchParams.set("amount", String(Math.round(amount)))
        return url.toString()
      } catch (e) {
        // Fallback to generating a new one if parsing fails
      }
    }

    const bankNo = payment.bankAccountNo || siteSettings?.paymentBankAccountNo
    let bankCode = payment.bankName || siteSettings?.paymentBankCode || "MB"
    // Sanitize bankCode for VietQR (e.g. "MB Bank" -> "MB")
    if (bankCode.includes(" ")) {
      bankCode = bankCode.split(" ")[0].toUpperCase()
    }
    const accountName = payment.bankAccountName || siteSettings?.paymentBankAccountName || "ROSYCLASS"
    
    if (bankNo) {
      const amount = payment.remainingAmount > 0 ? payment.remainingAmount : payment.totalAmount
      const addInfo = getTransferContent()
      return `https://img.vietqr.io/image/${bankCode}-${bankNo}-compact2.svg?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(accountName)}`
    }
    
    // qrPayload chỉ là nội dung chuyển khoản (chưa cấu hình ngân hàng) thì không phải ảnh QR
    return payment.qrPayload?.startsWith("http") ? payment.qrPayload : null
  }

  // Phiếu đã thu đủ / hoàn tiền / huỷ: không in mã QR (mã sẽ mang số tiền tổng và dễ bị chuyển khoản lần nữa)
  // Người nộp tiền là phụ huynh; chưa liên kết phụ huynh thì để trống cho người nộp tự ghi
  const payerName: string = payment.student?.parent?.fullName || ""
  const isSettled = payment.remainingAmount <= 0 || ["PAID", "REFUNDED", "CANCELLED"].includes(payment.status)
  // Phiếu thu tháng: trang chi tiết gửi kèm bản có anh chị em đọc mới, danh sách thì dùng bản lưu lúc lập phiếu
  const billing: BillingSummary | null = payment.billingSummaryData ?? parseBillingSummary(payment.billingSummary)
  const familyDue = billing ? familyRemaining(billing, payment.remainingAmount) : 0
  const qrUrl = isSettled ? null : getQrUrl()

  const getShareText = () => {
    const studentName = payment.student?.fullName || "—"
    const parentName = payment.student?.parent?.fullName
    const dateStr = formatDate(payment.createdAt)
    
    let itemsText = ""
    if (payment.lineItems && payment.lineItems.length > 0) {
      itemsText = payment.lineItems.map((item: any) => `- ${item.description}: ${formatMoney(item.totalAmount)}`).join("\n")
    } else {
      itemsText = `- Học phí lớp ${payment.class?.name || payment.course?.name || "chưa xếp lớp"}: ${formatMoney(payment.totalAmount)}`
    }

    return `Kính gửi ${parentName ? `Phụ huynh ${parentName} (Học viên ${studentName})` : `Phụ huynh học viên ${studentName}`},

ROSYCLASS xin gửi thông tin xác nhận biên lai thu tiền:
- Số biên lai: ${displayCode}
- Ngày lập: ${dateStr}
- Chi tiết khoản thu:
${itemsText}
${billing ? `-----------------------------\n${billingSummaryText(billing, familyDue)}\n` : ""}-----------------------------
- Tổng tiền: ${formatMoney(payment.totalAmount)}
- Đã thanh toán: ${formatMoney(payment.paidAmount)}
- Số tiền còn lại: ${formatMoney(payment.remainingAmount)}
- Phương thức: ${paymentMethodLabels[payment.paymentMethod] || payment.paymentMethod}

Trân trọng cảm ơn quý phụ huynh!`
  }

  const captureReceiptAsBlob = async (): Promise<Blob | null> => {
    if (typeof window === "undefined") return null
    
    let html2canvas = (window as any).html2canvas?.default || (window as any).html2canvas
    
    if (typeof html2canvas !== "function") {
      const scriptUrl = "https://unpkg.com/html2canvas-pro@1.5.8/dist/html2canvas-pro.min.js"
      await new Promise<void>((resolve, reject) => {
        const existingScripts = document.querySelectorAll(`script[src*="html2canvas"]`)
        existingScripts.forEach(s => s.remove())

        const script = document.createElement("script")
        script.src = scriptUrl
        script.crossOrigin = "anonymous"
        script.onload = () => {
          setTimeout(() => resolve(), 50)
        }
        script.onerror = (err) => reject(err)
        document.body.appendChild(script)
      })
      
      html2canvas = (window as any).html2canvas?.default || (window as any).html2canvas
    }

    if (typeof html2canvas !== "function") {
      throw new Error("html2canvas is not loaded as a function")
    }

    const element = document.getElementById("receipt-print-content")
    if (!element) return null

    // Ảnh QR ở tên miền khác: tải về và nhúng dạng data URL để html2canvas vẽ được vào ảnh biên lai
    const qrImage = element.querySelector<HTMLImageElement>("img[data-receipt-qr]")
    const originalQrSrc = qrImage?.src
    if (qrImage && originalQrSrc && !originalQrSrc.startsWith("data:")) {
      try {
        const response = await fetch(originalQrSrc, { mode: "cors" })
        if (!response.ok) throw new Error(`QR ${response.status}`)
        const blob = await response.blob()
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result))
          reader.onerror = () => reject(reader.error)
          reader.readAsDataURL(blob)
        })
        qrImage.src = dataUrl
        await qrImage.decode().catch(() => undefined)
      } catch (error) {
        console.error("Không tải được ảnh QR:", error)
        toast.warning("Không tải được mã QR, ảnh biên lai sẽ thiếu QR. Kiểm tra kết nối mạng rồi thử lại.")
      }
    }

    try {
      return await renderReceipt(html2canvas, element)
    } finally {
      if (qrImage && originalQrSrc) qrImage.src = originalQrSrc
    }
  }

  const renderReceipt = async (html2canvas: any, element: HTMLElement): Promise<Blob | null> => {
    const canvas = await html2canvas(element, {
      useCORS: true,
      scale: 2,
      backgroundColor: "#ffffff",
      logging: false,
    })

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob: Blob | null) => {
        resolve(blob)
      }, "image/png")
    })
  }

  const handleSendZalo = async () => {
    setZaloSending(true)
    try {
      const blob = await captureReceiptAsBlob()
      if (blob) {
        const ClipboardItemClass = (window as any).ClipboardItem || (globalThis as any).ClipboardItem
        if (ClipboardItemClass) {
          await navigator.clipboard.write([
            new ClipboardItemClass({
              "image/png": blob
            })
          ])
          toast.success("Đã chụp & sao chép ảnh biên lai vào Clipboard! Nhấn Ctrl+V (Cmd+V) để gửi cho phụ huynh.")
        } else {
          throw new Error("ClipboardItem not supported")
        }
      } else {
        throw new Error("Cannot capture receipt")
      }
    } catch (err) {
      console.error(err)
      toast.error("Không thể tự động sao chép ảnh. Đang tải ảnh xuống máy của bạn...")
      try {
        const blob = await captureReceiptAsBlob()
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `rosyclass-bien-lai-${displayCode}.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }
      } catch (e) {
        console.error("Lỗi khi tải ảnh:", e)
      }
    } finally {
      const phone = payment.student?.parent?.phone || payment.student?.phone || ""
      const cleanPhone = phone.replace(/[^0-9]/g, "")
      const zaloUrl = cleanPhone ? `https://zalo.me/${cleanPhone}` : "https://zalo.me"
      window.open(zaloUrl, "_blank")
      setZaloSending(false)
    }
  }

  const handleSendEmail = async () => {
    setEmailSending(true)
    try {
      const blob = await captureReceiptAsBlob()
      if (blob) {
        try {
          const ClipboardItemClass = (window as any).ClipboardItem || (globalThis as any).ClipboardItem
          if (ClipboardItemClass) {
            await navigator.clipboard.write([
              new ClipboardItemClass({
                "image/png": blob
              })
            ])
            toast.success("Đã chụp & sao chép ảnh biên lai vào Clipboard!")
          }
        } catch (e) {
          console.error("Lỗi sao chép ảnh:", e)
        }

        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `rosyclass-bien-lai-${displayCode}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.info("Đã tải ảnh biên lai. Hãy đính kèm tệp này vào Email.")
      }
    } catch (err) {
      console.error("Lỗi tạo ảnh biên lai:", err)
    } finally {
      const email = payment.student?.parent?.email || payment.student?.email || ""
      const subject = encodeURIComponent(`ROSYCLASS - Biên lai thu học phí ${displayCode}`)
      const body = encodeURIComponent(`Kính gửi Phụ huynh,\n\nROSYCLASS xin gửi ảnh chụp biên lai học phí số ${displayCode} đính kèm.\n\n(Hệ thống đã tự động sao chép ảnh biên lai vào clipboard và tải ảnh xuống máy của bạn để tiện dán hoặc đính kèm).\n\nTrân trọng cảm ơn!`)
      const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`
      window.open(mailtoUrl, "_blank")
      setEmailSending(false)
    }
  }

  // Thông báo tháng in đúng như ảnh gửi phụ huynh: chụp lại rồi in ảnh
  const printNoticeImage = async () => {
    const win = window.open("", "_blank")
    if (!win) return
    try {
      const blob = await captureReceiptAsBlob()
      if (!blob) throw new Error("Cannot capture notice")
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(blob)
      })
      win.document.write(`<html><head><title>Thông báo học phí - ${escapeHtml(displayCode)}</title>
        <style>@page { size: A4 landscape; margin: 8mm; } body { margin: 0; } img { width: 100%; height: auto; }</style>
        </head><body><img src="${dataUrl}" alt="Thông báo học phí" /></body></html>`)
      win.document.close()
      win.addEventListener("load", () => {
        win.focus()
        win.print()
      })
    } catch (error) {
      console.error(error)
      win.close()
      toast.error("Không tạo được bản in thông báo học phí")
    }
  }

  const handlePrint = () => {
    if (isMonthly) {
      void printNoticeImage()
      return
    }
    const printArea = document.getElementById("receipt-print-content")
    if (!printArea) return

    const win = window.open("", "_blank")
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>In Biên Lai Thu Tiền - ${escapeHtml(displayCode)}</title>
            <style>
              @page { size: A5 landscape; margin: 5mm; }
              body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; font-size: 11.5px; color: #111; padding: 10px; margin: 0; line-height: 1.4; }
              .receipt-container { border: 1px dashed #444; padding: 15px; border-radius: 4px; box-sizing: border-box; }
              .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 12px; }
              .logo-area { font-weight: bold; font-size: 13px; text-transform: uppercase; }
              .logo-sub { font-size: 9px; color: #555; font-weight: normal; margin-top: 2px; }
              .title-area { text-align: right; }
              .title-main { font-size: 15px; font-weight: 800; color: #000; margin: 0; }
              .title-sub { font-size: 10px; font-weight: bold; margin-top: 2px; font-family: monospace; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; margin-bottom: 12px; }
              .info-item { display: flex; }
              .info-label { font-weight: 600; width: 90px; shrink: 0; }
              .info-value { border-bottom: 1px dotted #888; flex-grow: 1; }
              table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 12px; }
              th, td { border: 1px solid #666; padding: 5px 8px; text-align: left; }
              th { background-color: #f0f0f0; font-weight: bold; text-transform: uppercase; font-size: 10px; }
              .text-right { text-align: right; }
              .font-bold { font-weight: bold; }
              .summary-section { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; }
              .qr-block { display: flex; flex-direction: column; align-items: center; border: 1px solid #ddd; padding: 6px; border-radius: 4px; background: #fff; width: 130px; }
              .qr-img { width: 100px; height: 100px; }
              .qr-desc { font-size: 8px; text-align: center; color: #555; margin-top: 4px; }
              .amounts-block { flex-grow: 1; display: flex; flex-direction: column; gap: 4px; max-width: 300px; margin-left: auto; }
              .amount-row { display: flex; justify-content: space-between; padding: 2px 0; font-size: 11px; }
              .amount-row.total { border-top: 1px solid #333; font-weight: bold; font-size: 12px; padding-top: 4px; }
              .signatures-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; text-align: center; margin-top: 15px; font-size: 10.5px; }
              .signature-title { font-weight: bold; }
              .signature-space { height: 45px; }
              .signature-name { font-style: italic; color: #444; }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              <div class="header">
                <div class="logo-area">
                  ${escapeHtml((siteSettings?.siteName || "RosyClass").toUpperCase())}
                  <div class="logo-sub">${siteSettings?.address ? `Địa chỉ: ${escapeHtml(siteSettings.address)}` : ""}${siteSettings?.address && siteSettings?.phone ? " · " : ""}${siteSettings?.phone ? `Hotline: ${escapeHtml(siteSettings.phone)}` : ""}</div>
                </div>
                <div class="title-area">
                  <h1 class="title-main">BIÊN LAI THU TIỀN</h1>
                  <div class="title-sub">Số: ${escapeHtml(displayCode)}</div>
                </div>
              </div>
              
              <div class="info-grid">
                <div class="info-item"><span class="info-label">Học viên:</span><span class="info-value">${escapeHtml(payment.student?.fullName || "—")}</span></div>
                ${payerName ? `<div class="info-item"><span class="info-label">Phụ huynh:</span><span class="info-value">${escapeHtml(payerName)}${payment.student?.parent?.phone ? ` · ${escapeHtml(payment.student.parent.phone)}` : ""}</span></div>` : ""}
                <div class="info-item"><span class="info-label">Ngày lập phiếu:</span><span class="info-value">${formatDate(payment.createdAt)}</span></div>
                <div class="info-item"><span class="info-label">Điện thoại:</span><span class="info-value">${escapeHtml(payment.student?.phone || "—")}</span></div>
                <div class="info-item"><span class="info-label">Khóa học / Lớp:</span><span class="info-value">${escapeHtml(payment.course?.name || "—")}${payment.class ? ` / ${escapeHtml(payment.class.name)}` : ""}</span></div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Nội dung thu</th>
                    <th>Danh mục</th>
                    <th class="text-right">SL</th>
                    <th class="text-right">Đơn giá</th>
                    <th class="text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${payment.lineItems && payment.lineItems.length > 0 ? 
                    payment.lineItems.map((item: any) => `
                      <tr>
                        <td class="font-bold">${escapeHtml(item.description)}</td>
                        <td>${paymentCategoryLabels[item.category] || item.category}</td>
                        <td class="text-right">${item.quantity}</td>
                        <td class="text-right">${formatMoney(item.unitAmount)}</td>
                        <td class="text-right font-bold">${formatMoney(item.totalAmount)}</td>
                      </tr>
                    `).join('') : `
                      <tr>
                        <td class="font-bold">Học phí lớp ${escapeHtml(payment.class?.name || payment.course?.name || "chưa xếp lớp")}</td>
                        <td>Học phí</td>
                        <td class="text-right">1</td>
                        <td class="text-right">${formatMoney(payment.totalAmount)}</td>
                        <td class="text-right font-bold">${formatMoney(payment.totalAmount)}</td>
                      </tr>
                    `
                  }
                </tbody>
              </table>

              ${billing ? billingSummaryHtml(billing, familyDue) : ""}

              <div class="summary-section">
                ${qrUrl ? `
                  <div class="qr-block">
                    <img class="qr-img" src="${qrUrl}" alt="QR code" />
                    <div class="qr-desc">Quét QR chuyển khoản nhanh</div>
                  </div>
                ` : ""}
                
                <div class="amounts-block">
                  <div class="amount-row"><span>Tổng tiền phải đóng:</span><span class="font-bold">${formatMoney(payment.totalAmount)}</span></div>
                  <div class="amount-row"><span>Đã thanh toán:</span><span class="font-bold text-emerald-700" style="color: #047857;">${formatMoney(payment.paidAmount)}</span></div>
                  <div class="amount-row total"><span>Còn lại cần thu:</span><span class="font-bold text-orange-700" style="color: #c2410c;">${formatMoney(payment.remainingAmount)}</span></div>
                  <div class="amount-row" style="font-size: 10px; color: #555;"><span>Phương thức:</span><span>${paymentMethodLabels[payment.paymentMethod] || payment.paymentMethod}</span></div>
                </div>
              </div>

              <div class="signatures-grid">
                <div>
                  <span class="signature-title">Người nộp tiền</span><br/>(Ký, ghi rõ họ tên)
                  <div class="signature-space"></div>
                  <span class="signature-name">${escapeHtml(payerName)}</span>
                </div>
                <div>
                  <span class="signature-title">Người lập phiếu</span><br/>(Ký, họ tên)
                  <div class="signature-space"></div>
                  <span class="signature-name">${escapeHtml(payment.createdBy?.fullName || "Hệ thống")}</span>
                </div>
                <div>
                  <span class="signature-title">Thủ quỹ</span><br/>(Ký, đóng dấu)
                  <div class="signature-space"></div>
                  <span class="signature-name">Ban Tài chính</span>
                </div>
              </div>
            </div>
          </body>
        </html>
      `)
      win.document.close()
      // Chờ ảnh QR tải xong rồi mở hộp thoại in
      win.addEventListener("load", () => {
        win.focus()
        win.print()
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`w-[94vw] ${isMonthly ? "sm:max-w-[1100px]" : "sm:max-w-4xl"} p-6 max-h-[95vh] overflow-y-auto`}>
        <DialogHeader className="border-b pb-3 flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-primary">
            <FileText className="h-5 w-5" />
            {isMonthly ? "Thông báo thu học phí" : "Biên lai thu học phí"}
          </DialogTitle>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint} disabled={!contentReady} className="gap-1.5 h-8">
              <Printer className="h-3.5 w-3.5" />
              In biên lai
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleSendZalo} 
              disabled={zaloSending || !contentReady}
              className="gap-1.5 h-8 border-[#0068ff]/30 text-[#0068ff] hover:bg-[#0068ff]/5 hover:text-[#0054d1]"
            >
              <Send className="h-3.5 w-3.5" />
              {zaloSending ? "Đang chụp ảnh..." : "Gửi Zalo PH"}
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleSendEmail} 
              disabled={emailSending || !contentReady}
              className="gap-1.5 h-8 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            >
              <Mail className="h-3.5 w-3.5" />
              {emailSending ? "Đang chụp ảnh..." : "Gửi Email PH"}
            </Button>
          </div>
        </DialogHeader>

        {isMonthly ? (
          <div className="mt-4 overflow-x-auto">
            {notice?.notice ? (
              <div id="receipt-print-content" className="w-max min-w-full bg-white">
                <FamilyNoticeView notice={notice.notice} siteName={siteSettings?.siteName || "RosyClass"} />
              </div>
            ) : notice?.error ? (
              <p className="py-10 text-center text-sm text-destructive">{notice.error}</p>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">Đang tạo thông báo học phí…</p>
            )}
          </div>
        ) : (
        /* Receipt content displayed inside modal */
        <div id="receipt-print-content" className="space-y-6 mt-4">
          <div className="border border-dashed border-muted-foreground/40 rounded-lg p-5 bg-card">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 border-b-2 border-primary/20 pb-4 mb-4">
              <div>
                <h3 className="font-bold text-sm text-foreground tracking-wide uppercase">
                  {(siteSettings?.siteName || "RosyClass").toUpperCase()}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {siteSettings?.address && <span>Địa chỉ: {siteSettings.address}</span>}
                  {siteSettings?.address && siteSettings?.phone && <span> · </span>}
                  {siteSettings?.phone && <span>Hotline: {siteSettings.phone}</span>}
                </p>
              </div>
              <div className="sm:text-right">
                <h2 className="text-lg font-extrabold text-primary uppercase tracking-tight">
                  BIÊN LAI THU TIỀN
                </h2>
                <span className="text-xs font-mono font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground block mt-1 w-max sm:ml-auto">
                  Số: {displayCode}
                </span>
              </div>
            </div>

            {/* Info Grid (3 columns for rich full details) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-sm bg-muted/20 p-4 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Học viên & Phụ huynh</p>
                <p className="font-bold text-foreground mt-1 text-base">{payment.student?.fullName || "—"}</p>
                {payment.student?.parent ? (
                  <div className="mt-1.5 text-xs text-muted-foreground space-y-0.5 border-t pt-1.5">
                    <p><span className="font-medium text-foreground">Phụ huynh:</span> {payment.student.parent.fullName}</p>
                    <p><span className="font-medium text-foreground">SĐT PH:</span> {payment.student.parent.phone}</p>
                    {payment.student.parent.email && <p><span className="font-medium text-foreground">Email PH:</span> {payment.student.parent.email}</p>}
                  </div>
                ) : (
                  <div className="mt-1 text-xs text-muted-foreground space-y-0.5">
                    <p>SĐT: {payment.student?.phone || "—"}</p>
                    {payment.student?.email && <p>Email: {payment.student.email}</p>}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Khóa học & Lớp</p>
                <p className="font-semibold text-foreground mt-1">{payment.course?.name || "—"}</p>
                {payment.class && (
                  <p className="text-xs text-primary font-medium mt-1">Lớp: {payment.class.name}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Thời hạn & Người tạo</p>
                <p className="text-xs text-foreground mt-1">
                  <span className="text-muted-foreground">Ngày lập:</span> {formatDate(payment.createdAt)}
                </p>
                {payment.dueDate && (
                  <p className="text-xs text-foreground mt-0.5">
                    <span className="text-muted-foreground">Hạn thanh toán:</span> <span className="font-medium text-orange-600">{formatDate(payment.dueDate)}</span>
                  </p>
                )}
                <p className="text-xs text-foreground mt-0.5">
                  <span className="text-muted-foreground">Người lập:</span> {payment.createdBy?.fullName || "Hệ thống"}
                </p>
              </div>
            </div>

            {/* Line items Table */}
            <div className="overflow-x-auto mb-6 border rounded-lg">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground font-semibold text-xs border-b">
                    <th className="py-2.5 px-3 text-left">Nội dung thu</th>
                    <th className="py-2.5 px-3 text-left border-l">Danh mục</th>
                    <th className="py-2.5 px-3 text-right border-l">SL</th>
                    <th className="py-2.5 px-3 text-right border-l">Đơn giá</th>
                    <th className="py-2.5 px-3 text-right border-l">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {payment.lineItems && payment.lineItems.length > 0 ? (
                    payment.lineItems.map((item: any) => (
                      <tr key={item.id} className="border-b last:border-b-0 hover:bg-muted/10 transition-colors">
                        <td className="py-3 px-3 font-semibold text-foreground">{item.description}</td>
                        <td className="py-3 px-3 border-l text-muted-foreground">{paymentCategoryLabels[item.category] || item.category}</td>
                        <td className="py-3 px-3 border-l text-right font-mono">{item.quantity}</td>
                        <td className="py-3 px-3 border-l text-right text-muted-foreground font-mono">{formatMoney(item.unitAmount)}</td>
                        <td className="py-3 px-3 border-l text-right font-bold text-foreground font-mono">{formatMoney(item.totalAmount)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-b last:border-b-0 hover:bg-muted/10 transition-colors">
                      <td className="py-3 px-3 font-semibold text-foreground">
                        Học phí lớp {payment.class?.name || payment.course?.name || "chưa xếp lớp"}
                      </td>
                      <td className="py-3 px-3 border-l text-muted-foreground">Học phí</td>
                      <td className="py-3 px-3 border-l text-right font-mono">1</td>
                      <td className="py-3 px-3 border-l text-right text-muted-foreground font-mono">{formatMoney(payment.totalAmount)}</td>
                      <td className="py-3 px-3 border-l text-right font-bold text-foreground font-mono">{formatMoney(payment.totalAmount)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {billing ? (
              <div className="mb-6 rounded-lg border p-3">
                <BillingSummaryView summary={billing} />
                {billing.siblings.length > 0 ? (
                  <p className="mt-3 border-t pt-2 text-sm">
                    Cả nhà còn phải đóng tháng này: <strong>{formatMoney(familyDue)}</strong>
                  </p>
                ) : null}
              </div>
            ) : null}

            {/* Note Section if exists */}
            {payment.note && (
              <div className="mt-4 mb-6 text-xs bg-amber-50/40 border border-amber-200/50 rounded-lg p-3 text-amber-900/80">
                <span className="font-bold">Ghi chú phiếu thu:</span>
                <p className="mt-1 whitespace-pre-wrap">{payment.note}</p>
              </div>
            )}

            {/* Bottom Summary Section (Amounts + QR Code) */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-4 border-t border-dashed">
              {/* QR Code Section */}
              {qrUrl ? (
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-muted/10 p-3 rounded-lg border w-full md:w-auto shrink-0">
                  <div className="flex flex-col items-center bg-white p-2 rounded border shadow-xs">
                    <img
                      src={qrUrl}
                      data-receipt-qr
                      crossOrigin="anonymous"
                      alt="VietQR code"
                      className="w-32 h-32 object-contain"
                    />
                    <div className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mt-1.5">
                      <QrCode className="h-3 w-3" />
                      Quét QR chuyển khoản
                    </div>
                  </div>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <p className="font-bold text-foreground uppercase tracking-wide text-[10px]">Tài khoản nhận học phí:</p>
                    <p><span className="font-medium text-foreground">Ngân hàng:</span> {payment.bankName || siteSettings?.paymentBankCode || "MB"}</p>
                    <p><span className="font-medium text-foreground">Số TK:</span> {payment.bankAccountNo || siteSettings?.paymentBankAccountNo || "—"}</p>
                    <p><span className="font-medium text-foreground">Chủ TK:</span> {payment.bankAccountName || siteSettings?.paymentBankAccountName || "—"}</p>
                    <p><span className="font-medium text-foreground">Nội dung:</span> <span className="font-mono bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-bold">{getTransferContent()}</span></p>
                  </div>
                </div>
              ) : (
                <div className="h-2" />
              )}

              {/* Amounts Details Card */}
              <div className="flex-1 w-full flex flex-col gap-2 max-w-[320px] md:ml-auto">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Tổng tiền phải đóng:</span>
                  <span className="font-semibold">{formatMoney(payment.totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Đã thanh toán:</span>
                  <span className="font-semibold text-emerald-600">{formatMoney(payment.paidAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-base pt-2 border-t font-bold">
                  <span className="text-foreground">Còn lại cần thu:</span>
                  <span className="text-orange-600">{formatMoney(payment.remainingAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground pt-1.5 gap-2">
                  <span className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    Phương thức:
                  </span>
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                    {paymentMethodLabels[payment.paymentMethod] || payment.paymentMethod}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Signatures block */}
            <div className="grid grid-cols-3 gap-4 text-center text-xs mt-8 pt-4 border-t border-muted/30">
              <div>
                <p className="font-bold text-foreground">Người nộp tiền</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">(Ký, ghi rõ họ tên)</p>
                <div className="h-16" />
                <p className="italic text-muted-foreground">{payerName}</p>
              </div>
              <div>
                <p className="font-bold text-foreground">Người lập phiếu</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">(Ký, họ tên)</p>
                <div className="h-16" />
                <p className="italic text-muted-foreground">{payment.createdBy?.fullName || "Hệ thống"}</p>
              </div>
              <div>
                <p className="font-bold text-foreground">Thủ quỹ</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">(Ký, đóng dấu)</p>
                <div className="h-16" />
                <p className="italic text-muted-foreground">Ban Tài chính</p>
              </div>
            </div>
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
