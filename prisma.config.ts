import { defineConfig } from '@prisma/config'
import * as dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  // เพิ่มส่วนนี้เข้าไปครับ เพื่อบอก Prisma ว่าไฟล์ seed อยู่ที่ไหน
  migrations: {
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
