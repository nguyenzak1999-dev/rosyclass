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
  Wallet,
  PieChart,
  Settings,
  MonitorPlay,
  FileText,
  Globe,
  Images,
  LayoutTemplate,
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

const data = {
  navGroups: [
    {
      label: "TỔNG QUAN",
      items: [
        {
          title: "Dashboard",
          url: "/admin/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Báo cáo",
          url: "/admin/reports",
          icon: PieChart,
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
        },
        {
          title: "Học viên",
          url: "/admin/students",
          icon: Users,
        },
        {
          title: "Phụ huynh",
          url: "/admin/parents",
          icon: Users,
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
        },
        {
          title: "Lớp học",
          url: "/admin/classes",
          icon: GraduationCap,
        },
        {
          title: "Lịch học",
          url: "/admin/schedules",
          icon: CalendarDays,
        },
        {
          title: "Điểm danh",
          url: "/admin/attendance",
          icon: CalendarCheck,
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
        },
      ]
    },
    {
      label: "GIAO DIỆN",
      items: [
        {
          title: "Hero trang chủ",
          url: "/admin/cms/hero",
          icon: LayoutTemplate,
        },
      ]
    },
    {
      label: "HỆ THỐNG",
      items: [
        {
          title: "Website CMS",
          url: "/admin/cms/pages",
          icon: MonitorPlay,
        },
        {
          title: "Góc học tập (Blog)",
          url: "/admin/cms/blog",
          icon: FileText,
        },
        {
          title: "Thư viện Media",
          url: "/admin/media",
          icon: Images,
        },
        {
          title: "Cài đặt Website",
          url: "/admin/settings/site",
          icon: Globe,
        },
        {
          title: "Chi nhánh",
          url: "/admin/settings/branches",
          icon: Settings,
        },
        {
          title: "Tài khoản & Tùy chọn",
          url: "/admin/settings/preferences",
          icon: UserCheck,
        },
      ]
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

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
        {data.navGroups.map((group) => (
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
