import type { Metadata } from "next"

import { prisma } from "@/lib/prisma"
import { createPageMetadata } from "@/lib/seo"
import PlacementTestClient, { type PlacementQuestionView } from "./placement-test-client"

export const metadata: Metadata = createPageMetadata({
  title: "Kiểm tra trình độ",
  description: "Cho bé làm bài kiểm tra trình độ tiếng Anh miễn phí tại RosyClass để ba mẹ nhận tư vấn lộ trình học phù hợp — dành cho trẻ mầm non và tiểu học.",
  path: "/kiem-tra-trinh-do",
})

function parseOptions(rawOptions: string): string[] {
  try {
    const options = JSON.parse(rawOptions)
    return Array.isArray(options) ? options.map(String).filter(Boolean) : []
  } catch {
    return []
  }
}

export default async function PlacementTestPage() {
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
