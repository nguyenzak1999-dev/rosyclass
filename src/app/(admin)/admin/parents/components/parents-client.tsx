"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { columns, type ParentData } from "./columns"
import { ParentDialog } from "./parent-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import {
  Phone,
  Mail,
  MapPin,
  Search,
  LayoutGrid,
  List,
  User,
  Users,
} from "lucide-react"

interface ParentsClientProps {
  parents: ParentData[]
  students: any[]
}

export function ParentsClient({ parents, students }: ParentsClientProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("list")

  const filteredParents = React.useMemo(() => {
    if (!query) return parents
    const lower = query.toLowerCase()
    return parents.filter(p => 
      p.fullName?.toLowerCase().includes(lower) ||
      p.phone?.toLowerCase().includes(lower) ||
      p.email?.toLowerCase().includes(lower) ||
      p.relationship?.toLowerCase().includes(lower) ||
      p.address?.toLowerCase().includes(lower)
    )
  }, [parents, query])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Phụ huynh</h1>
        <ParentDialog students={students} />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm kiếm phụ huynh theo tên, SĐT, quan hệ..."
            className="h-10 bg-background pl-9"
          />
        </div>
        <div className="flex border rounded-lg p-0.5 bg-muted/40 shrink-0 self-end md:self-auto">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 rounded-md"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 rounded-md"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === "grid" ? (
        filteredParents.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredParents.map((parent) => {
              const children = parent.students || []
              return (
                <Card
                  key={parent.id}
                  className="cursor-pointer transition-all hover:bg-accent/10 hover:border-primary/30 hover:shadow-sm flex flex-col justify-between"
                  onClick={(e) => {
                    const target = e.target as HTMLElement
                    if (target.closest("button") || target.closest("a") || target.closest("[role='button']")) {
                      return
                    }
                    router.push(`/admin/parents/${parent.id}`)
                  }}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {parent.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-base truncate hover:underline text-primary" onClick={() => router.push(`/admin/parents/${parent.id}`)}>
                            {parent.fullName}
                          </h3>
                          {parent.relationship && (
                            <Badge variant="outline" className="mt-1">
                              {parent.relationship}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge variant={children.length > 0 ? "default" : "outline"} className="shrink-0">
                        {children.length} con
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 pb-3 text-sm flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                      <span>{parent.phone}</span>
                    </div>
                    {parent.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                        <span className="truncate">{parent.email}</span>
                      </div>
                    )}
                    {parent.address && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                        <span className="truncate">{parent.address}</span>
                      </div>
                    )}
                    {children.length > 0 && (
                      <div className="flex items-start gap-2 text-muted-foreground mt-1">
                        <Users className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground/70" />
                        <div className="flex flex-wrap gap-1">
                          {children.map(child => (
                            <Badge key={child.id} variant="secondary" className="text-xs" onClick={() => router.push(`/admin/students/${child.id}`)}>
                              {child.fullName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter
                    className="p-4 pt-0 border-t bg-muted/10 flex items-center justify-end gap-2 h-12"
                    // Dialog sửa render qua portal nhưng sự kiện vẫn nổi lên Card (onClick chuyển trang)
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/parents/${parent.id}`)}>
                      Chi tiết
                    </Button>
                    <ParentDialog
                      initialData={parent as any}
                      students={students}
                      trigger={<Button variant="ghost" size="sm">Sửa</Button>}
                    />
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-4 text-center">
            <User className="mb-3 h-10 w-10 text-muted-foreground/60" />
            <p className="font-medium">Không tìm thấy phụ huynh phù hợp</p>
          </div>
        )
      ) : (
        <DataTable
          columns={columns(students)}
          data={filteredParents}
          onRowClick={(row) => router.push(`/admin/parents/${row.id}`)}
        />
      )}
    </div>
  )
}
