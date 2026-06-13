"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Users,
  UserCheck,
  GraduationCap,
  BookOpen,
  CalendarDays,
  CalendarCheck,
  UserPlus,
  TrendingUp,
  BarChart3,
  DollarSign,
  AlertCircle,
  Briefcase,
  Wallet,
  Banknote,
  PieChart,
  Settings,
  MonitorPlay,
  FileText,
  Globe,
  Images,
  LayoutTemplate,
  MessageCircleQuestion,
  Star,
  ClipboardCheck,
  Bell
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { canAccessAny, type AdminUser, type PermissionCode, PERMISSIONS } from "@/lib/auth/permission-definitions"

const data = {
  navGroups: [
    {
      label: "TỔNG QUAN",
      items: [
        {
          title: "Dashboard",
          url: "/admin/dashboard",
          icon: LayoutDashboard,
          permissions: [PERMISSIONS.dashboardRead]
        },
        {
          title: "Báo cáo",
          url: "/admin/reports",
          icon: PieChart,
          permissions: [PERMISSIONS.reportsRead]
        },
        {
          title: "Báo cáo chuyên cần",
          url: "/admin/reports/attendance",
          icon: CalendarCheck,
          permissions: [PERMISSIONS.attendanceRead]
        },
        {
          title: "Báo cáo doanh thu",
          url: "/admin/reports/revenue",
          icon: DollarSign,
          permissions: [PERMISSIONS.paymentsRead]
        },
        {
          title: "Báo cáo công nợ",
          url: "/admin/reports/debt",
          icon: AlertCircle,
          permissions: [PERMISSIONS.paymentsRead]
        },
        {
          title: "Báo cáo chuyển đổi Lead",
          url: "/admin/reports/leads",
          icon: TrendingUp,
          permissions: [PERMISSIONS.leadsRead]
        },
        {
          title: "Báo cáo lấp đầy lớp",
          url: "/admin/reports/classes",
          icon: BarChart3,
          permissions: [PERMISSIONS.classesRead]
        },
        {
          title: "Báo cáo khối lượng GV",
          url: "/admin/reports/teachers",
          icon: Briefcase,
          permissions: [PERMISSIONS.teachersRead]
        },
        {
          title: "Thông báo",
          url: "/admin/notifications",
          icon: Bell,
          permissions: [PERMISSIONS.studentsRead]
        }
      ]
    },
    {
      label: "HỌC VIÊN & KHÁCH HÀNG",
      items: [
        {
          title: "Leads CRM",
          url: "/admin/leads",
          icon: UserCheck,
          permissions: [PERMISSIONS.leadsRead]
        },
        {
          title: "Học viên",
          url: "/admin/students",
          icon: Users,
          permissions: [PERMISSIONS.studentsRead]
        },
        {
          title: "Phụ huynh",
          url: "/admin/parents",
          icon: Users,
          permissions: [PERMISSIONS.parentsRead]
        }
      ]
    },
    {
      label: "ĐÀO TẠO & LỊCH HỌC",
      items: [
        {
          title: "Khóa học",
          url: "/admin/courses",
          icon: BookOpen,
          permissions: [PERMISSIONS.coursesRead]
        },
        {
          title: "Lớp học",
          url: "/admin/classes",
          icon: GraduationCap,
          permissions: [PERMISSIONS.classesRead]
        },
        {
          title: "Lịch học",
          url: "/admin/schedules",
          icon: CalendarDays,
          permissions: [PERMISSIONS.schedulesRead]
        },
        {
          title: "Điểm danh",
          url: "/admin/attendance",
          icon: CalendarCheck,
          permissions: [PERMISSIONS.attendanceRead]
        },
        {
          title: "Xếp lớp",
          url: "/admin/classes/arrange",
          icon: UserPlus,
          permissions: [PERMISSIONS.classesWrite]
        }
      ]
    },
    {
      label: "NHÂN SỰ",
      items: [
        {
          title: "Giáo viên",
          url: "/admin/teachers",
          icon: Users,
          permissions: [PERMISSIONS.teachersRead]
        }
      ]
    },
    {
      label: "TÀI CHÍNH",
      items: [
        {
          title: "Tài chính học viên",
          url: "/admin/payments",
          icon: Wallet,
          permissions: [PERMISSIONS.paymentsRead]
        },
        {
          title: "Bảng lương giáo viên",
          url: "/admin/payroll",
          icon: Banknote,
          permissions: [PERMISSIONS.teachersRead]
        }
      ]
    },
    {
      label: "CẤU HÌNH WEBSITE",
      items: [
        {
          title: "Cài đặt Website",
          url: "/admin/settings/site",
          icon: Globe,
          permissions: [PERMISSIONS.settingsRead]
        },
        {
          title: "Thư viện Media",
          url: "/admin/media",
          icon: Images,
          permissions: [PERMISSIONS.mediaRead]
        }
      ]
    },
    {
      label: "CMS TRANG CHỦ",
      items: [
        {
          title: "Giao diện trang chủ",
          url: "/admin/cms/home",
          icon: LayoutTemplate,
          permissions: [PERMISSIONS.cmsRead]
        },
        {
          title: "Hero/Banner",
          url: "/admin/cms/banners",
          icon: Images,
          permissions: [PERMISSIONS.cmsRead]
        },
        {
          title: "Cảm nhận học viên",
          url: "/admin/cms/testimonials",
          icon: Star,
          permissions: [PERMISSIONS.cmsRead]
        }
      ]
    },
    {
      label: "CMS NỘI DUNG",
      items: [
        {
          title: "Website CMS",
          url: "/admin/cms/pages",
          icon: MonitorPlay,
          permissions: [PERMISSIONS.cmsRead]
        },
        {
          title: "Góc học tập (Blog)",
          url: "/admin/cms/blog",
          icon: FileText,
          permissions: [PERMISSIONS.cmsRead]
        },
        {
          title: "FAQ",
          url: "/admin/cms/faqs",
          icon: MessageCircleQuestion,
          permissions: [PERMISSIONS.cmsRead]
        }
      ]
    },
    {
      label: "CMS TƯƠNG TÁC",
      items: [
        {
          title: "Câu hỏi placement test",
          url: "/admin/cms/placement-questions",
          icon: ClipboardCheck,
          permissions: [PERMISSIONS.cmsRead]
        },
        {
          title: "Thông báo form",
          url: "/admin/cms/notifications",
          icon: Bell,
          permissions: [PERMISSIONS.cmsRead]
        }
      ]
    },
    {
      label: "HỆ THỐNG",
      items: [
        {
          title: "Chi nhánh",
          url: "/admin/settings/branches",
          icon: Settings,
          permissions: [PERMISSIONS.settingsRead]
        },
        {
          title: "Tài khoản & Tùy chọn",
          url: "/admin/settings/preferences",
          icon: UserCheck,
          permissions: [PERMISSIONS.settingsRead]
        }
      ]
    }
  ]
}

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: AdminUser
}) {
  const pathname = usePathname()
  const [activeModule, setActiveModule] = React.useState<"center" | "website">("center")
  const lastPathnameRef = React.useRef(pathname)

  React.useEffect(() => {
    const isCmsPath =
      pathname.startsWith("/admin/cms") ||
      pathname.startsWith("/admin/media") ||
      pathname.startsWith("/admin/settings/site")

    if (pathname !== lastPathnameRef.current) {
      if (isCmsPath) {
        setActiveModule("website")
      } else {
        setActiveModule("center")
      }
      lastPathnameRef.current = pathname
    }
  }, [pathname])

  React.useEffect(() => {
    const isCmsPath =
      pathname.startsWith("/admin/cms") ||
      pathname.startsWith("/admin/media") ||
      pathname.startsWith("/admin/settings/site")
    if (isCmsPath) {
      setActiveModule("website")
    } else {
      setActiveModule("center")
    }
  }, [])

  const centerGroups = ["TỔNG QUAN", "HỌC VIÊN & KHÁCH HÀNG", "ĐÀO TẠO & LỊCH HỌC", "NHÂN SỰ", "TÀI CHÍNH", "HỆ THỐNG"]
  const websiteGroups = ["CẤU HÌNH WEBSITE", "CMS TRANG CHỦ", "CMS NỘI DUNG", "CMS TƯƠNG TÁC"]

  const navGroups = data.navGroups
    .filter((group) => {
      if (activeModule === "center") {
        return centerGroups.includes(group.label)
      } else {
        return websiteGroups.includes(group.label)
      }
    })
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccessAny(user, item.permissions as PermissionCode[]))
    }))
    .filter((group) => group.items.length > 0)

  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex h-16 items-center justify-center border-b px-4">
        <div className="text-primary flex w-full items-center gap-2 text-xl font-bold">
          <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-md">
            R
          </div>
          RosyClass
        </div>
      </SidebarHeader>

      <div className="px-3 py-2.5 border-b bg-muted/10 flex flex-col gap-1.5">
        <div className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase px-1">
          Phân hệ quản lý
        </div>
        <div className="grid grid-cols-2 gap-1 bg-muted/50 p-1 rounded-lg border border-border/40">
          <button
            onClick={() => setActiveModule("center")}
            className={`flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activeModule === "center"
                ? "bg-background text-primary shadow-sm border border-border/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            Trung tâm
          </button>
          <button
            onClick={() => setActiveModule("website")}
            className={`flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activeModule === "website"
                ? "bg-background text-primary shadow-sm border border-border/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            Website
          </button>
        </div>
      </div>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton render={<Link href={item.url} />} isActive={pathname.startsWith(item.url)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
