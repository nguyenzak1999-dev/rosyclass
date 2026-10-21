import { createScriptPrisma } from "./script-client"

const prisma = createScriptPrisma()

async function main() {
  const students = await prisma.student.findMany({
    where: {
      code: null,
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  console.log(`Found ${students.length} students without code. Starting backfill...`)

  // To prevent conflicts with any manual or future codes, let's find the max existing numeric code first
  const lastStudent = await prisma.student.findFirst({
    where: {
      code: {
        startsWith: "HV",
      },
    },
    orderBy: {
      code: "desc",
    },
  })

  let startNum = 1
  if (lastStudent && lastStudent.code) {
    const match = lastStudent.code.match(/HV(\d+)/)
    if (match) {
      startNum = parseInt(match[1], 10) + 1
    }
  }

  for (let i = 0; i < students.length; i++) {
    const student = students[i]
    const nextNum = startNum + i
    const code = `HV${String(nextNum).padStart(4, "0")}`
    
    await prisma.student.update({
      where: { id: student.id },
      data: { code },
    })
    console.log(`Updated student ${student.fullName} with code ${code}`)
  }

  console.log("Backfill complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
