// Mã phiếu thu và nội dung QR chuyển khoản, dùng chung cho phiếu thường và phiếu thu theo tháng
import { prisma } from "@/lib/prisma"
import { vietnamDateKey } from "@/lib/curriculum"

function removeDiacritics(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase();
}

export async function generateReceiptCode() {
  // Ngày theo giờ VN (Worker chạy UTC: 0h–7h sáng sẽ ra ngày hôm trước)
  const yyyymmdd = vietnamDateKey(new Date()).replaceAll("-", "")

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase()
    const receiptCode = `PT-${yyyymmdd}-${suffix}`
    const existing = await prisma.payment.findUnique({ where: { receiptCode } })
    if (!existing) return receiptCode
  }

  return `PT-${yyyymmdd}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

export function buildQrPayload(
  receiptCode: string,
  amount: number,
  student?: { code?: string | null; fullName?: string | null } | null
) {
  const bankCode = process.env.VIETQR_BANK_CODE
  const accountNo = process.env.PAYMENT_BANK_ACCOUNT_NO
  const accountName = process.env.PAYMENT_BANK_ACCOUNT_NAME

  let addInfo = `ROSY ${receiptCode}`
  if (student && student.code) {
    const cleanName = student.fullName ? removeDiacritics(student.fullName) : ""
    addInfo = `ROSY ${student.code} ${cleanName}`.trim()
  }

  if (!bankCode || !accountNo) {
    return addInfo
  }

  const params = new URLSearchParams({
    amount: String(Math.round(amount)),
    addInfo
  })
  if (accountName) {
    params.set("accountName", accountName)
  }

  return `https://img.vietqr.io/image/${bankCode}-${accountNo}-compact2.png?${params.toString()}`
}
