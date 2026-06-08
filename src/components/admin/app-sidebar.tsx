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
  Wallet,
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
  Bell,
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
  SidebarRail,
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
          permissions: [PERMISSIONS.dashboardRead],
        },
        {
          title: "Báo cáo",
          url: "/admin/reports",
          icon: PieChart,
          permissions: [PERMISSIONS.reportsRead],
        },
        {
          title: "Báo cáo chuyên cần",
          url: "/admin/reports/attendance",
          icon: PieChart,
          permissions: [PERMISSIONS.attendanceRead],
        },
        {
          title: "Thông báo",
          url: "/admin/notifications",
          icon: Bell,
          permissions: [PERMISSIONS.studentsRead],
        },
      ]
    },
    {
      label: "HỌC VIÊN & KHÁCH HÀNG",
      items: [
        {
          title: "Leads CRM",
          url: "/admin/leads",
          icon: UserCheck,
          permissions: [PERMISSIONS.leadsRead],
        },
        {
          title: "Học viên",
          url: "/admin/students",
          icon: Users,
          permissions: [PERMISSIONS.studentsRead],
        },
        {
          title: "Phụ huynh",
          url: "/admin/parents",
          icon: Users,
          permissions: [PERMISSIONS.parentsRead],
        },
      ]
    },
    {
      label: "ĐÀO TẠO & LỊCH HỌC",
      items: [
        {
          title: "Khóa học",
          url: "/admin/courses",
          icon: BookOpen,
          permissions: [PERMISSIONS.coursesRead],
        },
        {
          title: "Lớp học",
          url: "/admin/classes",
          icon: GraduationCap,
          permissions: [PERMISSIONS.classesRead],
        },
        {
          title: "Lịch học",
          url: "/admin/schedules",
          icon: CalendarDays,
          permissions: [PERMISSIONS.schedulesRead],
        },
        {
          title: "Điểm danh",
          url: "/admin/attendance",
          icon: CalendarCheck,
          permissions: [PERMISSIONS.attendanceRead],
        },
        {
          title: "Xếp lớp",
          url: "/admin/classes/arrange",
          icon: UserPlus,
          permissions: [PERMISSIONS.classesWrite],
        },
      ]
    },
    {
      label: "NHÂN SỰ",
      items: [
        {
          title: "Giáo viên",
          url: "/admin/teachers",
          icon: Users,
          permissions: [PERMISSIONS.teachersRead],
        },
      ]
    },
    {
      label: "TÀI CHÍNH",
      items: [
        {
          title: "Tài chính",
          url: "/admin/payments",
          icon: Wallet,
          permissions: [PERMISSIONS.paymentsRead],
        },
      ]
    },
    {
      label: "GIAO DIỆN",
      items: [
        {
          title: "Cài đặt Website",
          url: "/admin/settings/site",
          icon: Globe,
          permissions: [PERMISSIONS.settingsRead],
        },
        {
          title: "Giao diện trang chủ",
          url: "/admin/cms/home",
          icon: LayoutTemplate,
          permissions: [PERMISSIONS.cmsRead],
        },
        {
          title: "Hero/Banner",
          url: "/admin/cms/banners",
          icon: Images,
          permissions: [PERMISSIONS.cmsRead],
        },
        {
          title: "Website CMS",
          url: "/admin/cms/pages",
          icon: MonitorPlay,
          permissions: [PERMISSIONS.cmsRead],
        },
        {
          title: "FAQ",
          url: "/admin/cms/faqs",
          icon: MessageCircleQuestion,
          permissions: [PERMISSIONS.cmsRead],
        },
        {
          title: "Cảm nhận học viên",
          url: "/admin/cms/testimonials",
          icon: Star,
          permissions: [PERMISSIONS.cmsRead],
        },
        {
          title: "Câu hỏi placement test",
          url: "/admin/cms/placement-questions",
          icon: ClipboardCheck,
          permissions: [PERMISSIONS.cmsRead],
        },
        {
          title: "Thông báo form",
          url: "/admin/cms/notifications",
          icon: Bell,
          permissions: [PERMISSIONS.cmsRead],
        },
        {
          title: "Góc học tập (Blog)",
          url: "/admin/cms/blog",
          icon: FileText,
          permissions: [PERMISSIONS.cmsRead],
        },
        {
          title: "Thư viện Media",
          url: "/admin/media",
          icon: Images,
          permissions: [PERMISSIONS.mediaRead],
        },
      ]
    },
    {
      label: "HỆ THỐNG",
      items: [
        {
          title: "Chi nhánh",
          url: "/admin/settings/branches",
          icon: Settings,
          permissions: [PERMISSIONS.settingsRead],
        },
        {
          title: "Tài khoản & Tùy chọn",
          url: "/admin/settings/preferences",
          icon: UserCheck,
          permissions: [PERMISSIONS.settingsRead],
        },
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
  const navGroups = data.navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccessAny(user, item.permissions as PermissionCode[])),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <Sidebar {...props}>
      <SidebarHeader className="h-16 flex items-center justify-center border-b px-4">
        <div className="font-bold text-xl text-primary flex items-center gap-2 w-full">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground">
            R
          </div>
          RosyClass
        </div>
      </SidebarHeader>
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
