"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BadgeStatus } from "@/components/ui/badge-status"
import { FileText, GraduationCap, Clock, User, Pencil } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

type TimelineItem = {
  id: string
  type: "NOTE" | "STATUS" | "PLACEMENT_TEST" | "CREATED"
  date: string | Date
  title: string
  description?: string
  actorName?: string
}

const TYPE_ICONS = {
  CREATED: User,
  NOTE: FileText,
  PLACEMENT_TEST: GraduationCap,
  STATUS: Pencil,
} as const

const TYPE_COLORS = {
  CREATED: "bg-blue-500",
  NOTE: "bg-gray-500",
  PLACEMENT_TEST: "bg-purple-500",
  STATUS: "bg-orange-500",
} as const

interface LeadTimelineTabProps {
  timeline: TimelineItem[]
}

export function LeadTimelineTab({ timeline }: LeadTimelineTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hoạt động</CardTitle>
        <CardDescription>
          Timeline đầy đủ các sự kiện của lead này ({timeline.length} sự kiện)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {timeline.length === 0 ? (
          <div className="h-24 flex items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground">
            Chưa có hoạt động nào.
          </div>
        ) : (
          <div className="relative space-y-4 pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
            {timeline.map((item) => {
              const Icon = TYPE_ICONS[item.type]
              return (
                <div key={item.id} className="relative">
                  <div
                    className={`absolute -left-6 w-5 h-5 rounded-full ${TYPE_COLORS[item.type]} flex items-center justify-center`}
                  >
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="font-medium text-sm">{item.title}</p>
                      <Badge variant="outline" className="text-xs">
                        {format(new Date(item.date), "dd/MM/yyyy HH:mm", { locale: vi })}
                      </Badge>
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    )}
                    {item.actorName && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Bởi: {item.actorName}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
