// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

// บังคับโหลดไฟล์ .env ให้รู้จัก DATABASE_URL
dotenv.config()

process.env.DATABASE_URL

const prisma = new PrismaClient()

async function main() {
  console.log('--- Start seeding frames ---')

  // ลบข้อมูลเก่าทิ้งก่อน (ถ้ามี) เพื่อกันข้อมูลซ้ำเวลาสั่งรันหลายรอบ
  await prisma.frame.deleteMany({})

  // ยัดข้อมูลกรอบรูปมาตรฐาน 120 บาท
  const frame6 = await prisma.frame.create({
    data: {
      name: 'Standard 6 Shots',
      price: 120,
      shotCount: 6,
      frameUrl: 'https://placehold.co/400x600/png?text=Frame+6+Shots',
      isActive: true,
    },
  })
  console.log(`✅ Created: ${frame6.name} (Price: ${frame6.price})`)

  // ยัดข้อมูลกรอบพรีเมียม 150 บาท
  const frame8 = await prisma.frame.create({
    data: {
      name: 'Premium 8 Shots',
      price: 150,
      shotCount: 8,
      frameUrl: 'https://placehold.co/400x600/png?text=Frame+8+Shots',
      isActive: true,
    },
  })
  console.log(`✅ Created: ${frame8.name} (Price: ${frame8.price})`)

  console.log('--- Seeding finished successfully ---')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })