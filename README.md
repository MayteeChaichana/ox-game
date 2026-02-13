OX Game Project
โปรเจกต์ Web Application เกม OX ที่มาพร้อมกับระบบ Bot AI, ระบบสมาชิกผ่าน Google OAuth 2.0 และตารางอันดับคะแนนแบบ Real-time (Global Leaderboard)

เทคโนโลยีที่ใช้
	Frontend: Next.js (App Router), Tailwind CSS, NextAuth.js
	Backend: NestJS, Prisma ORM
	Database: MySQL(Direct Connection via mysql2)
	Authentication: Google OAuth 2.0

คุณสมบัติของระบบ (Requirement Traceability)
	1. Authentication: ยืนยันตัวตนผ่าน Google Login ตามมาตรฐาน OAuth 2.0 ก่อนเริ่มเล่นเกม
	2. Game Mode: ระบบการเล่นแบบ Player vs Bot (AI) โดยผู้เล่นเป็น 'X' และ Bot เป็น 'O'
	3. Bot AI: ระบบสุ่มเดินอัตโนมัติ (Random Move Logic) พร้อมระบบ Delay เพื่อความสมจริง
	4. Leaderboard: ตารางจัดอันดับผู้เล่นที่คะแนนสูงสุด 10 อันดับแรก พร้อมระบบ Pagination

ระบบคะแนน
	1. ชนะบอท (Win): ได้รับ +1 คะแนน
	2. แพ้บอท (Loss): ถูกหัก -1 คะแนน (คะแนนรวมจะไม่ต่ำกว่า 0)
	3. โบนัสพิเศษ (Win Streak): หากชนะติดต่อกันครบ 3 ครั้ง จะได้รับโบนัสเพิ่มอีก +1 คะแนน (รวมเป็น +2 ในรอบนั้น) และเริ่มนับรอบใหม่

วิธีการติดตั้งและรันโปรเจกต์
	1. การเตรียมฐานข้อมูล
		สร้างฐานข้อมูลใน MySQL ชื่อ ox_db
	
	2. สร้าง Table Player และ GameLog โดยใช้อ้างอิงตาม Schema ดังนี้:
		CREATE TABLE Player (
			id INT AUTO_INCREMENT PRIMARY KEY,
			username VARCHAR(255) UNIQUE NOT NULL,
			totalScore INT DEFAULT 0,
			winStreak INT DEFAULT 0,
			createdAt DATETIME,
			updatedAt DATETIME
		);
	
	3. การตั้งค่า Backend (NestJS)
		3.1 เข้าไปที่โฟลเดอร์ ox-backend
		3.2 รันคำสั่ง npm install
		3.3 ตรวจสอบการเชื่อมต่อ Database ในไฟล์ app.service.ts (Host, User, Password)
		3.4 รันคำสั่ง npm run start:dev เพื่อเริ่มระบบ API ที่พอร์ต 3001
	
	3. การตั้งค่า Frontend
		3.1 เข้าไปที่โฟลเดอร์ ox-frontend
		3.2 รันคำสั่ง npm install เพื่อติดตั้ง Dependencies
		3.3 สร้างไฟล์ .env.local โดยคัดลอกเนื้อหามาจากไฟล์ .env.local.example
		3.4 กำหนดค่าคอนฟิกในไฟล์ .env.local ให้ครบถ้วน ดังนี้:
			- GOOGLE_CLIENT_ID: (ใส่ค่าที่ได้จาก Google Cloud Console)
			- GOOGLE_CLIENT_SECRET: (ใส่ค่าที่ได้จาก Google Cloud Console)
			- NEXTAUTH_URL: http://localhost:3000
			- NEXTAUTH_SECRET: (สุ่มตัวอักษรเพื่อใช้เข้ารหัส)
		3.5 รันคำสั่ง npm run dev เพื่อเริ่มระบบ Frontend ที่พอร์ต 3000

โครงสร้างโปรเจกต์
/ox-frontend: ส่วนของหน้าจอผู้ใช้งานและระบบจัดการ State เกม
/ox-backend: ระบบ API และส่วนการจัดการฐานข้อมูล (Database Management)
README.md: คู่มือการใช้งานและรายละเอียดโปรเจกต์