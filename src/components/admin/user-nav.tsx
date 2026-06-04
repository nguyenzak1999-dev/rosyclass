"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { User, Settings, LogOut } from "lucide-react"

export function UserNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-8 w-8 rounded-full" />}>
        <Avatar className="h-8 w-8">
          <AvatarImage src="https://i.pravatar.cc/150?u=a04258114e29026702d" alt="@admin" />
          <AvatarFallback>AD</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Admin RosyClass</p>
            <p className="text-xs leading-none text-muted-foreground">
              admin@rosyclass.edu.vn
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/admin/settings/preferences" />}>
            <User className="mr-2 h-4 w-4" />
            <span>Hồ sơ cá nhân</span>
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/admin/settings/preferences" />}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Tùy chọn & Cài đặt</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-red-600 cursor-pointer" 
          onClick={() => {
            // Fake logout, redirect to homepage
            window.location.href = "/"
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
