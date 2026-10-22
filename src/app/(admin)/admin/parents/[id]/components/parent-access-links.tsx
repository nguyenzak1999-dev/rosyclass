"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Copy, KeyRound, Link2, ShieldOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createParentAccessLink, revokeParentAccessLink } from "@/app/(admin)/admin/parents/actions"
import { nativeSelectClass } from "@/app/(admin)/admin/homework/components/homework-dialog"

export type AccessLink = {
  id: string
  label: string | null
  createdLabel: string
  createdBy: string | null
  expiresLabel: string | null
  lastUsedLabel: string | null
}

const VALIDITY_OPTIONS = [
  { value: 30, label: "1 tháng" },
  { value: 90, label: "3 tháng" },
  { value: 180, label: "6 tháng" },
  { value: 365, label: "1 năm" },
  { value: 0, label: "Không hết hạn" },
]

function zaloMessage(parentName: string, childNames: string[], url: string) {
  const children = childNames.length > 0 ? `của bé ${childNames.join(", ")}` : "của bé"
  return [
    `Chào ${parentName}, RosyClass gửi ba mẹ đường link riêng để xem lịch học, bài học hôm nay, nhận xét của cô và nộp bài tập về nhà ${children}:`,
    url,
    "Ba mẹ chỉ cần bấm vào link, không cần mật khẩu. Link dùng riêng cho gia đình mình, ba mẹ vui lòng không chia sẻ cho người khác nhé. Cảm ơn ba mẹ!",
  ].join("\n")
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success("Đã sao chép")
  } catch {
    toast.error("Trình duyệt không cho sao chép tự động, hãy bôi đen và sao chép thủ công")
  }
}

export function ParentAccessLinks({
  parentId,
  parentName,
  childNames,
  links,
  canWrite,
}: {
  parentId: string
  parentName: string
  childNames: string[]
  links: AccessLink[]
  canWrite: boolean
}) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = React.useState(false)
  const [label, setLabel] = React.useState("")
  const [validDays, setValidDays] = React.useState(180)
  const [creating, setCreating] = React.useState(false)
  const [created, setCreated] = React.useState<{ url: string; message: string } | null>(null)
  const [revokingId, setRevokingId] = React.useState<string | null>(null)
  const [revoking, setRevoking] = React.useState(false)

  const create = async () => {
    setCreating(true)
    const result = await createParentAccessLink({ parentId, label, validDays })
    setCreating(false)
    if (!result.success || !result.data) {
      toast.error(result.error)
      return
    }
    setCreated({ url: result.data.url, message: zaloMessage(parentName, childNames, result.data.url) })
    setLabel("")
    router.refresh()
  }

  const revoke = async () => {
    if (!revokingId) return
    setRevoking(true)
    const result = await revokeParentAccessLink(revokingId)
    setRevoking(false)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success("Đã thu hồi link")
    setRevokingId(null)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" /> Cổng phụ huynh
          </CardTitle>
          <CardDescription>
            Gửi link qua Zalo/SMS để ba mẹ xem lịch học, nhận xét, bài tập và báo cáo của con. Không cần mật khẩu.
          </CardDescription>
        </div>
        {canWrite ? (
          <Button
            onClick={() => {
              setCreated(null)
              setCreateOpen(true)
            }}
          >
            <Link2 className="mr-2 h-4 w-4" /> Tạo link cho phụ huynh
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">Chưa có link nào đang hoạt động.</p>
        ) : (
          <div className="divide-y rounded-lg border">
            {links.map((link) => (
              <div key={link.id} className="flex flex-wrap items-center gap-3 p-3">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-sm font-medium">
                    {link.label || "Link đăng nhập"}{" "}
                    <Badge variant="success" className="ml-1">
                      Đang hoạt động
                    </Badge>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tạo {link.createdLabel}
                    {link.createdBy ? ` bởi ${link.createdBy}` : ""} · {link.expiresLabel ? `Hết hạn ${link.expiresLabel}` : "Không hết hạn"} ·{" "}
                    {link.lastUsedLabel ? `Dùng gần nhất ${link.lastUsedLabel}` : "Chưa dùng"}
                  </p>
                </div>
                {canWrite ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setRevokingId(link.id)}
                  >
                    <ShieldOff className="mr-1 h-3.5 w-3.5" /> Thu hồi
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{created ? "Link đã sẵn sàng" : "Tạo link cho phụ huynh"}</DialogTitle>
            <DialogDescription>
              {created
                ? "Link chỉ hiện một lần. Hãy sao chép và gửi cho ba mẹ ngay; nếu làm mất, tạo link mới và thu hồi link cũ."
                : `Link đăng nhập cổng phụ huynh cho ${parentName}.`}
            </DialogDescription>
          </DialogHeader>

          {created ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="parent-link-url">Link</Label>
                <div className="flex gap-2">
                  <Input id="parent-link-url" readOnly value={created.url} onFocus={(event) => event.target.select()} />
                  <Button type="button" variant="outline" onClick={() => copyText(created.url)} aria-label="Sao chép link">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="parent-link-message">Tin nhắn Zalo gửi kèm</Label>
                <Textarea
                  id="parent-link-message"
                  readOnly
                  value={created.message}
                  className="min-h-[150px] text-sm"
                  onFocus={(event) => event.target.select()}
                />
                <Button type="button" variant="outline" onClick={() => copyText(created.message)}>
                  <Copy className="mr-2 h-4 w-4" /> Sao chép tin nhắn
                </Button>
              </div>
              <div className="flex justify-end border-t pt-4">
                <Button onClick={() => setCreateOpen(false)}>Xong</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="parent-link-label">Ghi chú (tuỳ chọn)</Label>
                <Input
                  id="parent-link-label"
                  value={label}
                  maxLength={100}
                  onChange={(event) => setLabel(event.target.value)}
                  placeholder="Zalo của mẹ"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="parent-link-validity">Hiệu lực</Label>
                <select
                  id="parent-link-validity"
                  className={nativeSelectClass}
                  value={validDays}
                  onChange={(event) => setValidDays(Number(event.target.value))}
                >
                  {VALIDITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Huỷ
                </Button>
                <Button onClick={create} disabled={creating}>
                  {creating ? "Đang tạo..." : "Tạo link"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(revokingId)}
        onOpenChange={(open) => !open && setRevokingId(null)}
        title="Thu hồi link này?"
        description="Ai đang dùng link này sẽ bị đăng xuất khỏi cổng phụ huynh ngay lập tức."
        confirmText="Thu hồi"
        variant="destructive"
        onConfirm={revoke}
        isSubmitting={revoking}
      />
    </Card>
  )
}
