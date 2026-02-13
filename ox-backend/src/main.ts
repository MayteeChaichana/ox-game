import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 1. เปิด CORS เพื่อให้ Frontend (พอร์ต 3000) ส่งข้อมูลมาหา Backend (พอร์ต 3001) ได้
  app.enableCors();

  // 2. เปลี่ยนพอร์ตเป็น 3001 หนีการชนกันกับ Frontend
  await app.listen(3001);
  console.log('🚀 [Backend]: Server is running on http://localhost:3001');
}
bootstrap();