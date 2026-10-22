// Nạp nội dung khởi đầu cho trung tâm tiếng Anh trẻ em (3–11 tuổi) vào D1 thật.
// Chạy lại nhiều lần vẫn an toàn: bản ghi đã có (theo câu hỏi / slug) được bỏ qua.
//
//   npm run db:seed-kids
//
// - Câu hỏi kiểm tra trình độ: xuất bản ngay để bài kiểm tra dùng được.
// - Chương trình học: tạo ở trạng thái NHÁP, chưa hiện ra web. Điền học phí, số buổi rồi bật "Hiển thị".
// - FAQ: hiện trên trang Hỏi đáp.
import { randomUUID } from "node:crypto"
import { DEFAULT_SITE_SETTINGS } from "../src/lib/site-settings"
import { nowIso, queryRows, runSql, sqlString } from "./lib/d1"

type Level = "KIDS" | "STARTER" | "A1" | "A2" | "ONE_ON_ONE"

// Câu hỏi bằng tiếng Anh đơn giản, kèm gợi ý tiếng Việt để ba mẹ đọc cùng bé nhỏ
const QUESTIONS: Array<{ type: string; level: Level; question: string; options: string[]; correct: number }> = [
  { type: "Từ vựng", level: "STARTER", question: "What colour is the sun? (Ông mặt trời màu gì?)", options: ["Blue", "Yellow", "Green"], correct: 1 },
  { type: "Từ vựng", level: "STARTER", question: "Which one is a cat? (Đâu là con mèo?)", options: ["Dog", "Cat", "Fish"], correct: 1 },
  { type: "Từ vựng", level: "STARTER", question: "How many legs does a bird have? (Con chim có mấy chân?)", options: ["Two", "Four", "Six"], correct: 0 },
  { type: "Mẫu câu", level: "STARTER", question: "Hello! What's your name?", options: ["I'm fine.", "My name is Lan.", "I'm six."], correct: 1 },
  { type: "Mẫu câu", level: "STARTER", question: "How old are you?", options: ["I'm seven.", "I'm happy.", "It's red."], correct: 0 },
  { type: "Từ vựng", level: "A1", question: "We read books in the ______.", options: ["kitchen", "library", "swimming pool"], correct: 1 },
  { type: "Ngữ pháp", level: "A1", question: "Look! The children ______ football.", options: ["play", "are playing", "plays"], correct: 1 },
  { type: "Ngữ pháp", level: "A1", question: "The ball is ______ the table. (Quả bóng ở dưới gầm bàn.)", options: ["under", "on", "in"], correct: 0 },
  { type: "Ngữ pháp", level: "A1", question: "My sister ______ milk every morning.", options: ["drink", "drinks", "drinking"], correct: 1 },
  { type: "Đọc hiểu", level: "A1", question: "Tom has a dog. It is brown and very big. What colour is Tom's dog?", options: ["Black", "White", "Brown"], correct: 2 },
  { type: "Ngữ pháp", level: "A2", question: "Yesterday, we ______ to the zoo.", options: ["go", "went", "going"], correct: 1 },
  { type: "Ngữ pháp", level: "A2", question: "An elephant is ______ than a monkey.", options: ["big", "bigger", "biggest"], correct: 1 },
  { type: "Từ vựng", level: "A2", question: "You use this to cut paper.", options: ["scissors", "a ruler", "glue"], correct: 0 },
  { type: "Ngữ pháp", level: "A2", question: "______ you like to come to my party?", options: ["Do", "Would", "Are"], correct: 1 },
  {
    type: "Đọc hiểu",
    level: "A2",
    question: "Mai woke up late, so she missed the school bus. Her dad drove her to school. Why did Mai's dad drive her?",
    options: ["Because it was raining.", "Because she missed the bus.", "Because she was ill."],
    correct: 1,
  },
]

const COURSES: Array<{ name: string; slug: string; level: Level; thumbnail: string; target: string; description: string; outcomes: string }> = [
  {
    name: "Tiếng Anh Mầm non (3–5 tuổi)",
    slug: "tieng-anh-mam-non",
    level: "KIDS",
    thumbnail: "/demo/kids-preschool.svg",
    target: "Bé 3–5 tuổi, chưa cần biết đọc viết",
    description: "Bé làm quen tiếng Anh qua bài hát, trò chơi vận động, màu sắc và câu chuyện tranh.",
    outcomes: "Nghe và phản xạ với các câu lệnh đơn giản\nNói được từ vựng về màu sắc, con vật, đồ vật quen thuộc\nTự tin hát và chào hỏi bằng tiếng Anh",
  },
  {
    name: "Tiếng Anh Tiểu học lớp 1–2",
    slug: "tieng-anh-lop-1-2",
    level: "STARTER",
    thumbnail: "/demo/kids-grade-1-2.svg",
    target: "Bé học lớp 1 và lớp 2",
    description: "Học chữ cái, âm phonics và từ vựng theo chủ đề; bắt đầu nói câu ngắn và đọc từ đơn giản.",
    outcomes: "Nhận biết chữ cái và âm phonics cơ bản\nNói được câu ngắn về bản thân, gia đình, trường lớp\nĐọc và viết từ đơn giản",
  },
  {
    name: "Tiếng Anh Tiểu học lớp 3–5",
    slug: "tieng-anh-lop-3-5",
    level: "A1",
    thumbnail: "/demo/kids-grade-3-5.svg",
    target: "Bé học lớp 3, 4 và 5",
    description: "Luyện đủ nghe, nói, đọc, viết; nói thành đoạn ngắn và đọc hiểu câu chuyện đơn giản.",
    outcomes: "Giao tiếp theo chủ đề quen thuộc bằng câu hoàn chỉnh\nĐọc hiểu đoạn văn ngắn\nViết câu và đoạn văn đơn giản",
  },
  {
    name: "Cambridge Starters – Movers – Flyers",
    slug: "cambridge-starters-movers-flyers",
    level: "A2",
    thumbnail: "/demo/kids-classroom.svg",
    target: "Bé tiểu học muốn làm quen kỳ thi Cambridge Young Learners",
    description: "Ôn luyện theo dạng bài của Cambridge Young Learners, giúp bé quen đề và tự tin khi đi thi.",
    outcomes: "Làm quen cấu trúc đề Starters, Movers, Flyers\nLuyện kỹ năng nghe, đọc, viết và nói theo đề\nTự tin trong phần thi nói",
  },
  {
    name: "Kèm 1–1 cho bé",
    slug: "kem-1-1-cho-be",
    level: "ONE_ON_ONE",
    thumbnail: "/demo/kids-songs.svg",
    target: "Bé cần lộ trình riêng hoặc lịch học linh hoạt",
    description: "Giáo viên kèm riêng theo tốc độ và mục tiêu của từng bé.",
    outcomes: "Lộ trình riêng theo trình độ của bé\nLịch học linh hoạt theo gia đình\nBa mẹ nhận nhận xét sau mỗi buổi",
  },
]

const EXTRA_FAQS = [
  {
    question: "Một buổi học của bé diễn ra như thế nào?",
    answer: "Buổi học xen kẽ bài hát, trò chơi, thẻ hình và hoạt động nói theo cặp để bé vừa vận động vừa học, không ngồi một chỗ quá lâu.",
  },
  {
    question: "Bé nhút nhát có theo được lớp không?",
    answer: "Thầy cô khuyến khích bé từng bước qua trò chơi và lời khen; ba mẹ được trao đổi để cùng giúp con tự tin hơn.",
  },
]

const now = nowIso()
const statements: string[] = []

const existingQuestions = new Set(queryRows<{ question: string }>(`SELECT "question" FROM "PlacementQuestion"`).map((row) => row.question))
QUESTIONS.forEach((item, index) => {
  if (existingQuestions.has(item.question)) return
  statements.push(
    `INSERT INTO "PlacementQuestion" ("id","type","question","options","correctIndex","order","level","isPublished","createdAt","updatedAt") VALUES (${sqlString(randomUUID())},${sqlString(item.type)},${sqlString(item.question)},${sqlString(JSON.stringify(item.options))},${item.correct},${index + 1},${sqlString(item.level)},1,${sqlString(now)},${sqlString(now)})`
  )
})

for (const course of COURSES) {
  statements.push(
    `INSERT OR IGNORE INTO "Course" ("id","name","slug","level","description","targetAudience","learningOutcomes","thumbnail","isPublished","status","createdAt","updatedAt") VALUES (${sqlString(randomUUID())},${sqlString(course.name)},${sqlString(course.slug)},${sqlString(course.level)},${sqlString(course.description)},${sqlString(course.target)},${sqlString(course.outcomes)},${sqlString(course.thumbnail)},0,'DRAFT',${sqlString(now)},${sqlString(now)})`
  )
}

const existingFaqs = new Set(queryRows<{ question: string }>(`SELECT "question" FROM "Faq"`).map((row) => row.question))
;[...(DEFAULT_SITE_SETTINGS.faqs ?? []), ...EXTRA_FAQS].forEach((faq, index) => {
  if (existingFaqs.has(faq.question)) return
  statements.push(
    `INSERT INTO "Faq" ("id","question","answer","category","position","status","createdAt","updatedAt") VALUES (${sqlString(randomUUID())},${sqlString(faq.question)},${sqlString(faq.answer)},'Phụ huynh',${index + 1},'ACTIVE',${sqlString(now)},${sqlString(now)})`
  )
})

if (statements.length) runSql(statements.join(";\n"))

const [counts] = queryRows<{ questions: number; courses: number; faqs: number }>(
  `SELECT (SELECT count(*) FROM "PlacementQuestion" WHERE "isPublished" = 1) AS questions, (SELECT count(*) FROM "Course") AS courses, (SELECT count(*) FROM "Faq") AS faqs`
)
console.log(`Câu hỏi kiểm tra: ${counts.questions} · Chương trình (nháp): ${counts.courses} · FAQ: ${counts.faqs}`)
