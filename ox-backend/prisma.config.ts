import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // เปลี่ยนจาก process.env เป็น URL ตรงๆ ครับ
    url: "mysql://root:password123@localhost:3306/ox_db",
  },
});