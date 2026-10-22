// Nạp chương trình mẫu "Tiếng Anh lớp 1 (mẫu)" vào D1: 8 Unit theo chủ đề quen thuộc × 3 bài.
// Nội dung là chủ đề chung tự soạn (không chép giáo trình nào), để trung tâm sửa lại cho phù hợp.
// Chạy lại vẫn an toàn: đã có chương trình cùng tên thì bỏ qua.
//
//   npm run db:seed-curriculum                 # D1 remote (theo phiên `cf auth login`)
//   D1_LOCAL=1 npm run db:seed-curriculum      # D1 giả lập khi `npm run dev` đang chạy
import { randomUUID } from "node:crypto"
import { nowIso, queryRows, runSql, sqlString } from "./lib/d1"

const CURRICULUM_NAME = "Tiếng Anh lớp 1 (mẫu)"

type SampleUnit = {
  title: string
  objectives: string
  vocabulary: string[]
  patterns: string[]
  phonics: string
  /** Tên 3 bài: từ mới · mẫu câu · âm & ôn tập */
  lessons: [string, string, string]
  /** Trò chơi gợi ý cho bài 1 và bài 2 */
  games: [string, string]
  homework: [string, string, string]
}

const UNITS: SampleUnit[] = [
  {
    title: "Hello!",
    objectives: "Bé chào hỏi, nói tên mình và hỏi tên bạn.",
    vocabulary: ["hello", "hi", "goodbye", "bye", "name", "friend"],
    patterns: ["Hello! I'm Mai.", "What's your name?", "My name is Nam.", "Goodbye!"],
    phonics: "/h/ – hello, hat, hen",
    lessons: ["Say hello", "What's your name?", "Sound /h/ & review"],
    games: ["Bóng chuyền tên: chuyền bóng, ai nhận bóng thì nói \"Hello, I'm…\"", "Vòng tròn hỏi tên: hỏi bạn bên cạnh \"What's your name?\""],
    homework: ["Chào ba mẹ bằng tiếng Anh khi đi học về", "Hỏi tên một người trong nhà bằng tiếng Anh", "Tô màu tranh chữ H"],
  },
  {
    title: "My classroom",
    objectives: "Bé gọi tên đồ dùng học tập và làm theo lệnh đơn giản trong lớp.",
    vocabulary: ["book", "pen", "pencil", "ruler", "bag", "desk", "chair"],
    patterns: ["What's this?", "It's a book.", "Stand up, please.", "Sit down, please."],
    phonics: "/b/ – book, bag, ball",
    lessons: ["School things", "What's this?", "Sound /b/ & review"],
    games: ["Túi bí mật: sờ đồ vật trong túi rồi đoán tên", "Simon says với các lệnh stand up, sit down, open your book"],
    homework: ["Chỉ và gọi tên 3 đồ dùng trong cặp sách", "Hỏi ba mẹ \"What's this?\" với 3 đồ vật", "Tô màu tranh chữ B"],
  },
  {
    title: "Colours",
    objectives: "Bé nhận biết và nói tên màu sắc, hỏi màu của đồ vật.",
    vocabulary: ["red", "blue", "yellow", "green", "orange", "pink", "purple"],
    patterns: ["What colour is it?", "It's red.", "I like blue."],
    phonics: "/r/ – red, rabbit, rain",
    lessons: ["Rainbow colours", "What colour is it?", "Sound /r/ & review"],
    games: ["Chạm màu: cô nói màu, bé chạy tới đồ vật có màu đó", "Thẻ màu úp: lật thẻ và hỏi \"What colour is it?\""],
    homework: ["Tìm 3 đồ vật màu đỏ trong nhà", "Nói màu yêu thích: \"I like…\"", "Tô màu cầu vồng theo hướng dẫn"],
  },
  {
    title: "Numbers 1–10",
    objectives: "Bé đếm từ 1 đến 10, hỏi và trả lời về số lượng, tuổi.",
    vocabulary: ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"],
    patterns: ["How many apples?", "Three apples.", "How old are you?", "I'm six."],
    phonics: "/n/ – nine, nose, nest",
    lessons: ["Count to ten", "How many?", "Sound /n/ & review"],
    games: ["Vỗ tay đếm số: cô giơ số, cả lớp vỗ tay đúng số lần", "Nhảy ô số: nhảy vào ô và đọc to con số"],
    homework: ["Đếm số bậc cầu thang ở nhà bằng tiếng Anh", "Hỏi tuổi một người thân: \"How old are you?\"", "Nối số với số chấm tròn"],
  },
  {
    title: "My family",
    objectives: "Bé giới thiệu các thành viên trong gia đình.",
    vocabulary: ["mother", "father", "sister", "brother", "grandma", "grandpa", "baby"],
    patterns: ["This is my mother.", "Who's this?", "It's my brother."],
    phonics: "/f/ – family, father, fish",
    lessons: ["My family members", "Who's this?", "Sound /f/ & review"],
    games: ["Gia đình ngón tay: hát và chỉ từng ngón tay", "Đoán ai đây: xem ảnh gia đình và hỏi \"Who's this?\""],
    homework: ["Giới thiệu ảnh gia đình với ba mẹ bằng tiếng Anh", "Vẽ một người trong gia đình", "Tô màu tranh chữ F"],
  },
  {
    title: "Animals",
    objectives: "Bé gọi tên con vật quen thuộc và nói con vật mình thích.",
    vocabulary: ["cat", "dog", "bird", "fish", "duck", "cow", "chicken"],
    patterns: ["What's this? It's a cat.", "I like dogs.", "The duck says quack."],
    phonics: "/d/ – dog, duck, door",
    lessons: ["Animal friends", "I like dogs", "Sound /d/ & review"],
    games: ["Bắt chước con vật: một bé làm động tác, cả lớp đoán", "Tiếng kêu con vật: nghe tiếng và gọi tên"],
    homework: ["Bắt chước tiếng kêu 3 con vật cho ba mẹ đoán", "Nói con vật mình thích: \"I like…\"", "Tô màu tranh chữ D"],
  },
  {
    title: "Toys",
    objectives: "Bé gọi tên đồ chơi, nói mình có đồ chơi gì.",
    vocabulary: ["ball", "doll", "car", "kite", "teddy bear", "robot", "yo-yo"],
    patterns: ["I have a ball.", "Do you have a kite?", "Yes, I do. / No, I don't."],
    phonics: "/t/ – toy, teddy, ten",
    lessons: ["My toys", "Do you have a kite?", "Sound /t/ & review"],
    games: ["Cửa hàng đồ chơi: bé chọn đồ chơi và nói \"I have a…\"", "Đi tìm đồ chơi: giấu thẻ hình quanh lớp"],
    homework: ["Giới thiệu đồ chơi yêu thích bằng tiếng Anh", "Hỏi ba mẹ \"Do you have a…?\"", "Tô màu tranh chữ T"],
  },
  {
    title: "Food",
    objectives: "Bé gọi tên món ăn quen thuộc, nói mình thích hay không thích.",
    vocabulary: ["apple", "banana", "milk", "bread", "rice", "egg", "cake"],
    patterns: ["I like apples.", "Do you like milk?", "Yes, I do. / No, I don't."],
    phonics: "/m/ – milk, mango, mum",
    lessons: ["Yummy food", "Do you like milk?", "Sound /m/ & review"],
    games: ["Bữa tiệc giả vờ: mời bạn và nói \"I like…\"", "Giỏ trái cây: rút thẻ và hỏi \"Do you like…?\""],
    homework: ["Kể món ăn sáng hôm nay bằng tiếng Anh", "Hỏi ba mẹ \"Do you like…?\" với 2 món", "Tô màu tranh chữ M"],
  },
]

function lessonPlan(unit: SampleUnit, index: 0 | 1 | 2) {
  const words = unit.vocabulary.slice(0, 4).join(", ")
  if (index === 0) {
    return [
      "1. Khởi động (5 phút): hát bài chào, ôn từ của buổi trước.",
      `2. Từ mới (10 phút): giới thiệu bằng flashcard – ${unit.vocabulary.join(", ")}.`,
      "3. Luyện nói (10 phút): cả lớp nhắc lại, rồi từng nhóm, rồi từng bé.",
      `4. Trò chơi (10 phút): ${unit.games[0]}.`,
      "5. Tô màu / vận động nhẹ (5 phút).",
      "6. Kết thúc (5 phút): tặng sao, nhắc bài về nhà, hát bài chào tạm biệt.",
    ].join("\n")
  }
  if (index === 1) {
    return [
      `1. Khởi động (5 phút): ôn từ ${words} bằng trò \"cô giơ thẻ – bé nói\".`,
      `2. Mẫu câu (10 phút): ${unit.patterns.join(" / ")} – cô làm mẫu với rối tay.`,
      "3. Luyện theo cặp (10 phút): hai bạn hỏi – đáp, đổi vai.",
      `4. Trò chơi (10 phút): ${unit.games[1]}.`,
      "5. Kết thúc (5 phút): một vài bé nói mẫu câu trước lớp, tặng sao.",
    ].join("\n")
  }
  return [
    `1. Khởi động (5 phút): hát lại bài hát của Unit.`,
    `2. Âm (10 phút): ${unit.phonics} – nghe, nhắc lại, tìm từ có âm này.`,
    "3. Ôn tập (15 phút): trò chơi tổng hợp từ vựng và mẫu câu của Unit.",
    "4. Kiểm tra nhanh (5 phút): mỗi bé nói 1 từ và 1 câu.",
    "5. Kết thúc (5 phút): tổng kết sao cả Unit, khen các bé tiến bộ.",
  ].join("\n")
}

const existing = queryRows<{ id: string }>(`SELECT "id" FROM "Curriculum" WHERE "name" = ${sqlString(CURRICULUM_NAME)} LIMIT 1`)
if (existing.length > 0) {
  console.log(`Đã có "${CURRICULUM_NAME}", bỏ qua.`)
  process.exit(0)
}

const now = nowIso()
const curriculumId = randomUUID()
const statements = [
  `INSERT INTO "Curriculum" ("id","name","gradeLabel","description","sourceBook","status","createdAt","updatedAt") VALUES (${sqlString(curriculumId)},${sqlString(CURRICULUM_NAME)},'Lớp 1',${sqlString("Chương trình mẫu 8 chủ đề quen thuộc, mỗi chủ đề 3 bài (từ mới · mẫu câu · âm và ôn tập). Sửa lại cho khớp giáo trình và lịch của trung tâm.")},NULL,'DRAFT',${sqlString(now)},${sqlString(now)})`,
]

UNITS.forEach((unit, unitIndex) => {
  const unitId = randomUUID()
  statements.push(
    `INSERT INTO "CurriculumUnit" ("id","curriculumId","order","title","objectives","vocabulary","sentencePatterns","phonics","songUrl","createdAt","updatedAt") VALUES (${sqlString(unitId)},${sqlString(curriculumId)},${unitIndex + 1},${sqlString(unit.title)},${sqlString(unit.objectives)},${sqlString(JSON.stringify(unit.vocabulary))},${sqlString(JSON.stringify(unit.patterns))},${sqlString(unit.phonics)},NULL,${sqlString(now)},${sqlString(now)})`
  )
  unit.lessons.forEach((title, lessonIndex) => {
    const index = lessonIndex as 0 | 1 | 2
    const objectives = [
      `Bé nhận biết và nói được: ${unit.vocabulary.join(", ")}.`,
      `Bé hỏi – đáp được: ${unit.patterns.join(" / ")}`,
      `Bé phát âm đúng ${unit.phonics.split(" – ")[0]} và ôn lại toàn bộ Unit.`,
    ][index]
    const materials = ["Flashcard từ vựng, bóng, tranh tô màu", "Flashcard, rối tay, thẻ hỏi – đáp", "Flashcard, phiếu tô chữ, loa phát bài hát"][index]
    statements.push(
      `INSERT INTO "Lesson" ("id","unitId","order","title","objectives","activities","materials","mediaUrl","homework","createdAt","updatedAt") VALUES (${sqlString(randomUUID())},${sqlString(unitId)},${lessonIndex + 1},${sqlString(title)},${sqlString(objectives)},${sqlString(lessonPlan(unit, index))},${sqlString(materials)},NULL,${sqlString(unit.homework[index])},${sqlString(now)},${sqlString(now)})`
    )
  })
})

runSql(statements.join(";\n"))

const [counts] = queryRows<{ units: number; lessons: number }>(
  `SELECT (SELECT count(*) FROM "CurriculumUnit" WHERE "curriculumId" = ${sqlString(curriculumId)}) AS units, (SELECT count(*) FROM "Lesson" l JOIN "CurriculumUnit" u ON u."id" = l."unitId" WHERE u."curriculumId" = ${sqlString(curriculumId)}) AS lessons`
)
console.log(`Đã tạo "${CURRICULUM_NAME}" (bản nháp): ${counts.units} Unit · ${counts.lessons} bài`)
