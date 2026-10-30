import type { Metadata } from "next"

import { prisma } from "@/lib/prisma"
import PlacementTestClient, { type PlacementQuestionView } from "./placement-test-client"
import { DesignedPage, designedPageMetadata } from "@/components/page-builder/designed-page"

export async function generateMetadata(): Promise<Metadata> {
  return designedPageMetadata("kiem-tra-trinh-do", {
    title: "Kiểm tra trình độ",
    description: "Cho bé làm bài kiểm tra trình độ tiếng Anh miễn phí tại RosyClass để ba mẹ nhận tư vấn lộ trình học phù hợp — dành cho trẻ mầm non và tiểu học.",
    path: "/kiem-tra-trinh-do",
  })
}

function parseOptions(rawOptions: string): string[] {
  try {
    const options = JSON.parse(rawOptions)
    return Array.isArray(options) ? options.map(String).filter(Boolean) : []
  } catch {
    return []
  }
}

async function PlacementTestPageContent() {
  const [questions, suggestedCourses] = await Promise.all([
    prisma.placementQuestion.findMany({
      where: {
        isPublished: true,
      },
      orderBy: [
        { order: "asc" },
        { createdAt: "asc" },
      ],
    }),
    // Lấy tất cả course ACTIVE + isPublished để suggest (filter theo level ở client)
    prisma.course.findMany({
      where: {
        status: "ACTIVE",
        isPublished: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        level: true,
        salePrice: true,
        tuitionFee: true,
        thumbnail: true,
      },
      orderBy: { name: "asc" },
    }),
  ])

  const viewQuestions: PlacementQuestionView[] = questions
    .map((question) => ({
      id: question.id,
      type: question.type,
      question: question.question,
      options: parseOptions(question.options),
      correctIndex: question.correctIndex,
    }))
    .filter((question) => question.options.length > question.correctIndex)

  return (
    <PlacementTestClient
      questions={viewQuestions}
      suggestedCourses={JSON.parse(JSON.stringify(suggestedCourses))}
    />
  )
}

// Trang thiết kế lại được trong CMS (page builder); phần trên là nội dung chính của trang
export default function PlacementTestPage() {
  return (
    <DesignedPage slug="kiem-tra-trinh-do">
      <PlacementTestPageContent />
    </DesignedPage>
  )
}
