import type { Metadata } from "next"

import { prisma } from "@/lib/prisma"
import { createPageMetadata } from "@/lib/seo"
import PlacementTestClient, { type PlacementQuestionView } from "./placement-test-client"

export const metadata: Metadata = createPageMetadata({
  title: "Kiểm tra trình độ",
  description: "Làm bài kiểm tra trình độ tiếng Anh miễn phí và nhận tư vấn lộ trình học phù hợp tại RosyClass.",
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
  const questions = await prisma.placementQuestion.findMany({
    where: {
      isPublished: true,
    },
    orderBy: [
      { order: "asc" },
      { createdAt: "asc" },
    ],
  })

  const viewQuestions: PlacementQuestionView[] = questions
    .map((question) => ({
      id: question.id,
      type: question.type,
      question: question.question,
      options: parseOptions(question.options),
      correctIndex: question.correctIndex,
    }))
    .filter((question) => question.options.length > question.correctIndex)

  return <PlacementTestClient questions={viewQuestions} />
}
