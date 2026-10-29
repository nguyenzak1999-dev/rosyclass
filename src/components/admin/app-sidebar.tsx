"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, ChevronsUpDown, KeyRound, LogOut, Search, X } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { canAccessAny, type AdminUser } from "@/lib/auth/permission-definitions"
import { cn } from "@/lib/utils"
import { ADMIN_NAV, activeNavUrl, normalizeSearch, type NavBadgeKey, type NavLink, type NavSection } from "./admin-nav"

export type AdminNavCounts = Partial<Record<NavBadgeKey, number>>

function canSee(user: AdminUser, link: NavLink) {
  return !link.permissions?.length || canAccessAny(user, link.permissions)
}

function matches(link: NavLink, query: string) {
  return normalizeSearch(`${link.title} ${link.keywords ?? ""}`).includes(query)
}

/** Lọc theo quyền và ô tìm kiếm; mục cha giữ lại khi còn mục con phù hợp */
function visibleNav(user: AdminUser, query: string): NavSection[] {
  return ADMIN_NAV.map((section) => ({
    ...section,
    items: section.items
      .map((item) => {
        if (!item.children) return canSee(user, item) && (!query || matches(item, query)) ? item : null
        const children = item.children.filter((child) => canSee(user, child) && (!query || matches(child, query) || matches(item, query)))
        return children.length > 0 ? { ...item, children } : null
      })
      .filter((item): item is NonNullable<typeof item> => item !== null),
  })).filter((section) => section.items.length > 0)
}

function initials(name: string) {
  const words = name.trim().split(/\s+/)
  return ((words.length > 1 ? words[words.length - 2][0] : "") + (words[words.length - 1]?.[0] ?? "")).toUpperCase() || "A"
}

export function AppSidebar({
  user,
  counts = {},
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: AdminUser
  counts?: AdminNavCounts
}) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  const [query, setQuery] = React.useState("")
  // Mục cha người dùng tự mở/đóng; chưa đụng tới thì tự mở khi đang ở trang con
  const [openOverrides, setOpenOverrides] = React.useState<Record<string, boolean>>({})

  const normalizedQuery = normalizeSearch(query)
  const sections = React.useMemo(() => visibleNav(user, normalizedQuery), [user, normalizedQuery])
  const allUrls = React.useMemo(
    () => ADMIN_NAV.flatMap((section) => section.items.flatMap((item) => [item.url, ...(item.children?.map((child) => child.url) ?? [])])),
    []
  )
  const activeUrl = activeNavUrl(pathname, allUrls)
  const resultCount = sections.reduce((sum, section) => sum + section.items.reduce((n, item) => n + (item.children?.length ?? 1), 0), 0)

  // Điện thoại: chọn mục xong thì đóng ngăn kéo
  const onNavigate = () => {
    if (isMobile) setOpenMobile(false)
    if (query) setQuery("")
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader className="gap-3 border-b px-3 py-3">
        <Link href="/admin/campus" onClick={onNavigate} className="flex items-center gap-2.5 rounded-lg px-1 outline-hidden focus-visible:ring-2 focus-visible:ring-sidebar-ring">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-lg font-bold text-sidebar-primary-foreground">
            R
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-bold">RosyClass</span>
            <span className="block truncate text-xs text-muted-foreground">Quản trị trung tâm</span>
          </span>
        </Link>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <SidebarInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setQuery("")
            }}
            placeholder="Tìm chức năng…"
            aria-label="Tìm chức năng"
            className="h-9 pl-8 pr-8"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground"
              aria-label="Xoá tìm kiếm"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {sections.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">Không có chức năng nào khớp “{query}”.</p>
        ) : null}
        {query && sections.length > 0 ? (
          <p className="sr-only" aria-live="polite">
            {resultCount} chức năng phù hợp
          </p>
        ) : null}

        {sections.map((section, index) => (
          <SidebarGroup key={section.label ?? index} className="py-1">
            {section.label ? <SidebarGroupLabel>{section.label}</SidebarGroupLabel> : null}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const Icon = item.icon
                  if (!item.children) {
                    const count = item.badge ? counts[item.badge] ?? 0 : 0
                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          render={<Link href={item.url} onClick={onNavigate} />}
                          isActive={activeUrl === item.url}
                          tooltip={item.title}
                        >
                          <Icon />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                        {count > 0 ? (
                          <SidebarMenuBadge className="bg-sidebar-primary text-sidebar-primary-foreground peer-hover/menu-button:text-sidebar-primary-foreground peer-data-active/menu-button:text-sidebar-primary-foreground">
                            {count > 99 ? "99+" : count}
                          </SidebarMenuBadge>
                        ) : null}
                      </SidebarMenuItem>
                    )
                  }

                  const containsActive = item.children.some((child) => child.url === activeUrl)
                  const open = query ? true : openOverrides[item.url] ?? containsActive
                  const subId = `nav-sub-${item.url.replace(/\W+/g, "-")}`
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        onClick={() => setOpenOverrides((current) => ({ ...current, [item.url]: !open }))}
                        aria-expanded={open}
                        aria-controls={subId}
                        className={cn(containsActive && !open && "font-semibold text-sidebar-primary")}
                      >
                        <Icon />
                        <span>{item.title}</span>
                        <ChevronRight className={cn("ml-auto transition-transform", open && "rotate-90")} aria-hidden />
                      </SidebarMenuButton>
                      {open ? (
                        <SidebarMenuSub id={subId}>
                          {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.url}>
                              <SidebarMenuSubButton
                                render={<Link href={child.url} onClick={onNavigate} />}
                                isActive={activeUrl === child.url}
                              >
                                <span>{child.title}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      ) : null}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton size="lg" className="data-popup-open:bg-sidebar-accent">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-xs font-bold text-sidebar-accent-foreground">
                      {initials(user.fullName)}
                    </span>
                    <span className="grid min-w-0 flex-1 text-left leading-tight">
                      <span className="truncate text-sm font-semibold">{user.fullName}</span>
                      <span className="truncate text-xs text-muted-foreground">{user.roleName}</span>
                    </span>
                    <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground" aria-hidden />
                  </SidebarMenuButton>
                }
              />
              <DropdownMenuContent side={isMobile ? "top" : "right"} align="end" className="w-60">
                <DropdownMenuLabel className="font-normal">
                  <p className="truncate text-sm font-medium">{user.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/admin/settings/preferences" onClick={onNavigate} />}>
                  <KeyRound className="mr-2 h-4 w-4" /> Hồ sơ & mật khẩu
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={async () => {
                    const { logout } = await import("@/app/(admin)/admin/actions")
                    await logout()
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
