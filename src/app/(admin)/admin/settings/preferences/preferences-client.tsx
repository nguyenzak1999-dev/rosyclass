"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import { 
  User, 
  Palette, 
  Bell, 
  Shield, 
  Globe, 
  Check, 
  Laptop, 
  Moon, 
  Sun, 
  Smartphone,
  LogOut,
  Key,
  ShieldAlert,
  Save,
  Camera,
  Type
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ADMIN_COLORS, getPrimaryForeground, resolveAdminPrimaryColor } from "@/lib/theme-appearance"
import type { AdminUser } from "@/lib/auth/permission-definitions"
import type { SiteSettings } from "@/lib/site-settings"
import { saveSiteSettings } from "../site/actions"
import { CreditCard } from "lucide-react"

const TABS = [
  { id: "profile", label: "Hồ sơ cá nhân", icon: User },
  { id: "appearance", label: "Giao diện", icon: Palette },
  { id: "notifications", label: "Thông báo", icon: Bell },
  { id: "security", label: "Bảo mật", icon: Shield },
  { id: "language", label: "Ngôn ngữ & Vùng", icon: Globe },
  { id: "payment", label: "Thanh toán", icon: CreditCard },
]

const RADII = [
  { name: "0", value: "0rem" },
  { name: "0.3", value: "0.3rem" },
  { name: "0.5 (Mặc định)", value: "0.5rem" },
  { name: "0.75", value: "0.75rem" },
  { name: "1.0", value: "1.0rem" },
]

const FONTS = [
  { name: "Google Sans (Mặc định)", value: "var(--font-sans)" },
]

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

export default function PreferencesClient({ user, siteSettings }: { user: AdminUser, siteSettings: SiteSettings }) {
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState("payment")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Appearance state
  const [primaryColor, setPrimaryColor] = useState(ADMIN_COLORS[0].value)
  const [radius, setRadius] = useState(RADII[2].value)
  const [fontFamily, setFontFamily] = useState(FONTS[0].value)

  useEffect(() => {
    void Promise.resolve().then(() => {
      const savedColor = localStorage.getItem("app-primary-color")
      const savedRadius = localStorage.getItem("app-radius")
      const savedFont = localStorage.getItem("app-font")

      if (savedColor) setPrimaryColor(savedColor)
      if (savedRadius) setRadius(savedRadius)
      if (savedFont && FONTS.some((font) => font.value === savedFont)) {
        setFontFamily(savedFont)
      }
    })
  }, [])

  useEffect(() => {
    // Áp dụng cấu hình lên document root
    const root = document.documentElement
    
    const isDark = theme === "dark"
    const activeColor = resolveAdminPrimaryColor(primaryColor, isDark)

    if (activeColor) {
      root.style.setProperty("--primary", activeColor)
      root.style.setProperty("--primary-foreground", getPrimaryForeground(activeColor))
      localStorage.setItem("app-primary-color", activeColor)
    }

    root.style.setProperty("--radius", radius)
    localStorage.setItem("app-radius", radius)

    root.style.setProperty("font-family", fontFamily)
    localStorage.setItem("app-font", fontFamily)

  }, [primaryColor, radius, fontFamily, theme])

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsSubmitting(false)
    toast.success("Đã lưu cài đặt thành công!")
  }

  // Notifs State
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [pushNotifs, setPushNotifs] = useState(true)
  const [marketingNotifs, setMarketingNotifs] = useState(false)

  // Payment State
  const [paymentBankCode, setPaymentBankCode] = useState(siteSettings.paymentBankCode || "")
  const [paymentBankAccountNo, setPaymentBankAccountNo] = useState(siteSettings.paymentBankAccountNo || "")
  const [paymentBankAccountName, setPaymentBankAccountName] = useState(siteSettings.paymentBankAccountName || "")

  const handleSavePaymentSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    const newSettings = {
      ...siteSettings,
      paymentBankCode,
      paymentBankAccountNo,
      paymentBankAccountName
    }
    const result = await saveSiteSettings(newSettings)
    setIsSubmitting(false)
    if (result.success) {
      toast.success("Đã lưu thông tin tài khoản VietQR!")
    } else {
      toast.error(result.error || "Có lỗi xảy ra khi lưu")
    }
  }

  return (
    <div className="flex flex-col space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cài đặt Hệ thống</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý tài khoản, giao diện, thanh toán và bảo mật hệ thống.
        </p>
      </div>
      <Separator />
      
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-1/4">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 hide-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                    ${isActive 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 max-w-3xl">
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-lg font-medium">Hồ sơ cá nhân</h3>
                <p className="text-sm text-muted-foreground">Cập nhật thông tin hiển thị của bạn với người dùng khác.</p>
              </div>
              <Separator />
              <div className="flex items-center gap-6">
                <div className="relative group cursor-pointer">
                  <Avatar className="w-24 h-24 border-4 border-background shadow-sm">
                    <AvatarFallback>{getInitials(user.fullName) || "AD"}</AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium">Ảnh đại diện</h4>
                  <p className="text-sm text-muted-foreground">Ảnh đại diện lấy từ hồ sơ tài khoản trong hệ thống.</p>
                  <Badge variant="outline" className="mt-2">{user.roleName}</Badge>
                </div>
              </div>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Họ và đệm</Label>
                    <Input id="firstName" defaultValue={user.fullName.split(" ").slice(0, -1).join(" ")} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Tên</Label>
                    <Input id="lastName" defaultValue={user.fullName.split(" ").slice(-1).join(" ")} readOnly />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email liên hệ</Label>
                  <Input id="email" type="email" defaultValue={user.email} readOnly />
                  <p className="text-xs text-muted-foreground">Email này sẽ dùng để nhận thông báo từ hệ thống.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Tiểu sử</Label>
                  <Textarea id="bio" defaultValue={`Vai trò: ${user.roleName}`} className="min-h-[100px]" readOnly />
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-lg font-medium">Giao diện (Appearance)</h3>
                <p className="text-sm text-muted-foreground">Tùy chỉnh màu sắc và phong cách giao diện của toàn bộ trang web.</p>
              </div>
              <Separator />
              
              <div className="space-y-4">
                <Label className="text-base">Chủ đề (Theme)</Label>
                <p className="text-sm text-muted-foreground">Chọn chủ đề sáng hoặc tối cho ứng dụng.</p>
                <RadioGroup 
                  value={theme} 
                  onValueChange={(val) => setTheme(val)} 
                  className="grid grid-cols-3 gap-4 pt-2"
                >
                  <div>
                    <RadioGroupItem value="light" id="theme-light" className="peer sr-only" />
                    <Label
                      htmlFor="theme-light"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <Sun className="mb-3 h-6 w-6" />
                      Sáng
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="dark" id="theme-dark" className="peer sr-only" />
                    <Label
                      htmlFor="theme-dark"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <Moon className="mb-3 h-6 w-6" />
                      Tối
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="system" id="theme-system" className="peer sr-only" />
                    <Label
                      htmlFor="theme-system"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <Laptop className="mb-3 h-6 w-6" />
                      Hệ thống
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4 pt-4">
                <Label className="text-base">Màu chủ đạo (Primary Color)</Label>
                <div className="flex flex-wrap gap-4 pt-2">
                  {ADMIN_COLORS.map((c) => {
                    const isActiveColor = primaryColor === c.value || primaryColor === c.isDark
                    return (
                      <button
                        key={c.name}
                        onClick={() => setPrimaryColor(theme === "dark" ? c.isDark : c.value)}
                        className={`flex flex-col items-center gap-2`}
                      >
                        <div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isActiveColor ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'}`}
                          style={{ backgroundColor: theme === "dark" ? c.isDark : c.value }}
                        >
                          {isActiveColor && <Check className="w-5 h-5 text-primary-foreground" />}
                        </div>
                        <span className="text-xs text-muted-foreground">{c.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Label className="text-base">Bán kính bo góc (Border Radius)</Label>
                <div className="flex flex-wrap gap-3 pt-2">
                  {RADII.map((r) => {
                    const isActiveRadius = radius === r.value
                    return (
                      <Button
                        key={r.name}
                        variant={isActiveRadius ? "default" : "outline"}
                        onClick={() => setRadius(r.value)}
                        className="transition-all"
                      >
                        {r.name}
                      </Button>
                    )
                  })}
                </div>
              </div>
              
              <div className="space-y-4 pt-4">
                <Label className="text-base flex items-center gap-2"><Type className="w-4 h-4"/> Font chữ (Typography)</Label>
                <div className="flex flex-col gap-3 pt-2">
                  {FONTS.map((f) => {
                    const isActiveFont = fontFamily === f.value
                    return (
                      <div 
                        key={f.name}
                        onClick={() => setFontFamily(f.value)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${isActiveFont ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}
                        style={{ fontFamily: f.value }}
                      >
                        <h4 className="font-medium text-lg mb-1">{f.name}</h4>
                        <p className="text-sm opacity-80">Giao diện sẽ hiển thị bằng font chữ này. Hãy chọn font chữ phù hợp với thương hiệu của bạn.</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t mt-6">
                <Button onClick={handleSave} disabled={isSubmitting}>
                  <Save className="w-4 h-4 mr-2" /> Lưu tùy chọn
                </Button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-lg font-medium">Thông báo (Notifications)</h3>
                <p className="text-sm text-muted-foreground">Chọn cách bạn muốn nhận thông báo từ hệ thống.</p>
              </div>
              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Thông báo Email</Label>
                    <p className="text-sm text-muted-foreground">Nhận email khi có học viên mới đăng ký hoặc thanh toán.</p>
                  </div>
                  <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
                </div>
                
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Thông báo Đẩy (Push Notifications)</Label>
                    <p className="text-sm text-muted-foreground">Nhận thông báo trực tiếp trên trình duyệt khi có tin nhắn mới.</p>
                  </div>
                  <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Bản tin Marketing</Label>
                    <p className="text-sm text-muted-foreground">Nhận email về tính năng mới, mẹo và thủ thuật hệ thống.</p>
                  </div>
                  <Switch checked={marketingNotifs} onCheckedChange={setMarketingNotifs} />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} disabled={isSubmitting}>Lưu thông báo</Button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-lg font-medium">Bảo mật (Security)</h3>
                <p className="text-sm text-muted-foreground">Quản lý mật khẩu và các lớp bảo mật bảo vệ tài khoản.</p>
              </div>
              <Separator />

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><Key className="w-4 h-4" /> Đổi mật khẩu</CardTitle>
                  <CardDescription>Bạn nên sử dụng mật khẩu mạnh với ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Mật khẩu mới</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  <Button variant="outline" className="mt-2" onClick={handleSave}>Cập nhật mật khẩu</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> Xác thực 2 bước (2FA)</CardTitle>
                  <CardDescription>Bảo vệ tài khoản với một mã xác nhận gửi tới điện thoại của bạn.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Trạng thái: <Badge variant="secondary">Đang tắt</Badge></p>
                  </div>
                  <Button variant="default">Bật 2FA</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><Smartphone className="w-4 h-4" /> Phiên đăng nhập</CardTitle>
                  <CardDescription>Các thiết bị đang đăng nhập vào tài khoản của bạn.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">MacBook Pro - Chrome</p>
                      <p className="text-xs text-muted-foreground">Đà Nẵng, Việt Nam • Đang hoạt động</p>
                    </div>
                    <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-0">Hiện tại</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">iPhone 14 Pro Max - Safari</p>
                      <p className="text-xs text-muted-foreground">Hà Nội, Việt Nam • 2 giờ trước</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive h-8 px-2"><LogOut className="w-4 h-4 mr-1"/> Đăng xuất</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "language" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-lg font-medium">Ngôn ngữ & Vùng</h3>
                <p className="text-sm text-muted-foreground">Cấu hình ngôn ngữ, định dạng ngày tháng và múi giờ hiển thị.</p>
              </div>
              <Separator />

              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label>Ngôn ngữ hiển thị (Language)</Label>
                  <Select defaultValue="vi">
                    <SelectTrigger className="w-full md:w-[300px]">
                      <SelectValue placeholder="Chọn ngôn ngữ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">🇻🇳 Tiếng Việt (Vietnamese)</SelectItem>
                      <SelectItem value="en">🇬🇧 Tiếng Anh (English)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Thay đổi ngôn ngữ cho giao diện quản trị.</p>
                </div>

                <div className="space-y-2">
                  <Label>Múi giờ (Timezone)</Label>
                  <Select defaultValue="asia-ho_chi_minh">
                    <SelectTrigger className="w-full md:w-[300px]">
                      <SelectValue placeholder="Chọn múi giờ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asia-ho_chi_minh">(GMT+07:00) Giờ Đông Dương (Hồ Chí Minh)</SelectItem>
                      <SelectItem value="asia-tokyo">(GMT+09:00) Giờ chuẩn Nhật Bản (Tokyo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Định dạng ngày (Date Format)</Label>
                  <Select defaultValue="dd-mm-yyyy">
                    <SelectTrigger className="w-full md:w-[300px]">
                      <SelectValue placeholder="Chọn định dạng ngày" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd-mm-yyyy">DD/MM/YYYY (Ví dụ: 31/12/2026)</SelectItem>
                      <SelectItem value="mm-dd-yyyy">MM/DD/YYYY (Ví dụ: 12/31/2026)</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD (Ví dụ: 2026-12-31)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} disabled={isSubmitting}>Lưu cấu hình vùng</Button>
              </div>
            </div>
          )}

          {activeTab === "payment" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-lg font-medium">Cấu hình thanh toán (VietQR)</h3>
                <p className="text-sm text-muted-foreground">Thông tin ngân hàng để tự động hiển thị mã VietQR chuyển khoản trên biên lai thu học phí.</p>
              </div>
              <Separator />

              <form onSubmit={handleSavePaymentSettings} className="space-y-4">
                <div className="space-y-2">
                  <Label>Mã ngân hàng (VietQR Bank Code) *</Label>
                  <Input 
                    value={paymentBankCode} 
                    onChange={(e) => setPaymentBankCode(e.target.value)} 
                    placeholder="Ví dụ: MB, VCB, TCB, BIDV..." 
                    required
                  />
                  <p className="text-[10px] text-muted-foreground">Mã ngân hàng viết tắt chuẩn VietQR (MB, VCB, TCB, BIDV, ACB, VPB...)</p>
                </div>
                <div className="space-y-2">
                  <Label>Số tài khoản *</Label>
                  <Input 
                    value={paymentBankAccountNo} 
                    onChange={(e) => setPaymentBankAccountNo(e.target.value)} 
                    placeholder="Ví dụ: 0983456789" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tên chủ tài khoản (Viết hoa không dấu) *</Label>
                  <Input 
                    value={paymentBankAccountName} 
                    onChange={(e) => setPaymentBankAccountName(e.target.value)} 
                    placeholder="Ví dụ: NGUYEN VAN A" 
                    required
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Đang lưu..." : "Lưu tài khoản"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
