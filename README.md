นี่คือเนื้อหาสำหรับอัปเดตลงในไฟล์ **`README.md`** โดยเพิ่มหัวข้อ **"วิธีติดตั้งและรันแบบ Local (Manual Setup)"** ไว้อย่างชัดเจน เพื่อให้กรรมการหรือผู้ตรวจสามารถเลือกเปิดระบบแบบรันตรงในเครื่องได้ทันที หากไม่อยากเจอปัญหา Docker:

---

```markdown
# 🎓 ระบบบริหารจัดการคำขอทุนการศึกษา มหาวิทยาลัยสงขลานครินทร์
> **PSU Scholarship Management System (POC Project)**  
> ระบบสำหรับยื่นคำขอรับทุนการศึกษาของนักศึกษา และระบบพิจารณาจัดการคำขอทุนการศึกษาสำหรับเจ้าหน้าที่

---

## 📌 คุณสมบัติเด่นของระบบ (Features)

### 👨‍🎓 สำหรับนักศึกษา (Public Portal)
* **แบบฟอร์มยื่นคำขอทุน:** รองรับการเลือกประเภททุน 5 ประเภท กรอกข้อมูลส่วนตัว ผลการเรียน GPAX วัตถุประสงค์ และระบุเลขบัญชีธนาคาร
* **ระบบตรวจสอบความถูกต้อง (Validation):** ตรวจสอบรูปแบบรหัสนักศึกษา, PSU Email, GPAX (0.00 - 4.00) และยอดเงิน
* **PDPA Consent:** ระบบยินยอมเงื่อนไขการคุ้มครองข้อมูลส่วนบุคคลก่อนส่งคำขอ

### 👨‍💼 สำหรับเจ้าหน้าที่ (Admin Portal)
* **ระบบรักษาความปลอดภัย:** การเข้าสู่ระบบด้วย JWT Authentication และรหัสผ่านที่ผ่านการเข้ารหัสด้วย `bcrypt`
* **การจัดการคำขอทุน (CRUD):** 
  * ดูรายการคำขอทุนพร้อมแบ่งหน้า (Pagination หน้าละ 10 รายการ)
  * ค้นหาคำขอด้วยรหัสนักศึกษา, ชื่อ-นามสกุล หรือเลขที่คำขอ (REQ-XXXX)
  * กรองข้อมูลตามสถานะ (`PENDING`, `APPROVED`, `REJECTED`) และตามประเภททุน
  * พิจารณาอนุมัติ/ไม่อนุมัติ พร้อมระบุหมายเหตุ
  * แก้ไขข้อมูลคำขอทุน และเพิ่มคำขอใหม่โดยเจ้าหน้าที่
  * ระบบลบข้อมูลแบบปลอดภัย (Soft Delete เฉพาะรายการที่รอพิจารณา)
* **Data Masking:** การปกปิดเลขที่บัญชีธนาคารเพื่อความปลอดภัย (เช่น `123-x-xx789-0`)
* **แดชบอร์ดสรุปภาพรวม (Dashboard):** แสดงตัวเลขสถิติคำขอแยกตามสถานะ และยอดรวมงบประมาณที่ขอรับทุนแยกตามประเภททุน

---

## 🛠️ สถาปัตยกรรมและเทคโนโลยี (Tech Stack)

| ส่วนของระบบ | เทคโนโลยีที่ใช้ |
| :--- | :--- |
| **Frontend** | React, React Router v6, Bootstrap 5, Axios, Vite |
| **Backend API** | Node.js, Express.js (RESTful API), JWT, Bcrypt |
| **Database & ORM** | PostgreSQL, Prisma ORM |
| **Containerization** | Docker, Docker Compose |

---

## 🚀 วิธีการติดตั้งและเริ่มต้นระบบ (Setup & Run)

เลือกวิธีการรันระบบได้ 2 รูปแบบตามความสะดวก:

### ⚙️ ตัวเลือกที่ 1: ติดตั้งและรันแบบ Local (แนะนำหากไม่ต้องการใช้ Docker)

#### 1. เตรียมฐานข้อมูลและตั้งค่า Environment
สร้างฐานข้อมูลใน PostgreSQL ชื่อ `psu_scholarship` และตรวจสอบไฟล์ `.env` ในโฟลเดอร์ `POC_scholaship_server`:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:1234@localhost:5432/psu_scholarship?schema=public"
JWT_SECRET="psu-scholarship-jwt-secret-key-2026"

```

#### 2. รันฝั่ง Backend & ฐานข้อมูล Prisma (Terminal 1)

```bash
cd POC_scholaship_server
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js
npm start

```

*(Backend RESTful API จะเริ่มทำงานที่พอร์ต `http://localhost:5000` พร้อม Seed ข้อมูล 25 รายการทันที)*

#### 3. รันฝั่ง Frontend Client (Terminal 2)

```bash
cd POC_scholarship_system
npm install
npm run dev

```

*(Frontend จะพร้อมใช้งานที่ `http://localhost:3000`)*

---

### 🐳 ตัวเลือกที่ 2: รันผ่าน Docker Compose (One-Command Setup)

1. สลับ `DATABASE_URL` ใน `.env` เป็นแบบชี้ไปยัง container:

```env
DATABASE_URL="postgresql://postgres:1234@postgres:5432/psu_scholarship?schema=public"

```

2. สั่งเริ่มระบบ:

```bash
docker compose up --build

```

---

## 🔑 บัญชีทดสอบสำหรับเจ้าหน้าที่ (Credentials)

| Username | Password | สิทธิ์ |
| --- | --- | --- |
| `admin` | `admin1234` | ผู้ดูแลระบบ / เจ้าหน้าที่สวัสดิการ |

---

## 📡 สรุป RESTful API Endpoints

### 🔐 Authentication

* `POST /api/auth/login` - เข้าสู่ระบบรับ JWT Token
* `POST /api/auth/register-admin` - สร้างบัญชี Admin ใหม่

### 📋 Scholarship Requests

* `GET /api/requests` - ดึงรายการคำขอทุน (รองรับ `page`, `limit`, `search`, `status`, `typeId`)
* `POST /api/requests` - ยื่นคำขอทุนใหม่ (นักศึกษา/เจ้าหน้าที่)
* `PUT /api/requests/:id` - แก้ไขข้อมูลคำขอทุน
* `PATCH /api/requests/:id/status` - พิจารณา/เปลี่ยนสถานะคำขอ (`PENDING`, `APPROVED`, `REJECTED`)
* `DELETE /api/requests/:id` - ลบคำขอทุน (Soft Delete)

### 📊 Master Data & Stats

* `GET /api/scholarship-types` - ดึงรายชื่อประเภททุนทั้งหมด
* `GET /api/requests/stats` - ดึงข้อมูลสรุปสถิติสำหรับ Dashboard

```

```