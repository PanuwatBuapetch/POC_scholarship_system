```markdown
# PSU Scholarship Management System (POC)

ระบบเว็บแอปสำหรับยื่นคำขอรับทุนของนักศึกษา และระบบจัดการ/พิจารณาคำขอสำหรับเจ้าหน้าที่ ม.อ. (โปรเจกต์ POC)

---

## ฟีเจอร์หลัก

### สำหรับนักศึกษา (หน้าบ้าน)
* ฟอร์มยื่นคำขอทุน เลือกได้ 5 ประเภท พร้อมกรอกประวัติ, เกรดเฉลี่ย (GPAX), เหตุผล และเลขบัญชี
* เช็กความถูกต้องของข้อมูลอัตโนมัติ (รหัสนักศึกษา, อีเมล ม.อ., GPAX 0.00-4.00, ยอดเงิน)
* มีกล่องกดยินยอมข้อกำหนด PDPA ก่อนกดส่งคำขอ

### สำหรับเจ้าหน้าที่ (หลังบ้าน)
* ล็อกอินด้วย JWT รหัสผ่านเข้ารหัสด้วย bcrypt
* หน้าจัดการคำขอทุน (ค้นหาตามชื่อ/รหัส/เลขคำขอ, แบ่งหน้าละ 10 รายการ, กรองตามสถานะและประเภททุน)
* กดอนุมัติ/ไม่อนุมัติ พร้อมใส่หมายเหตุได้
* แก้ไขข้อมูลคำขอได้ และมีระบบ Soft Delete สำหรับลบรายการที่อยู่ระหว่างรอพิจารณา
* ซ่อนเลขบัญชีธนาคาร (Data Masking) เช่น `123-x-xx789-0` เพื่อความปลอดภัย
* แดชบอร์ดสรุปยอดคำขอแต่ละสถานะและงบประมาณรวม

---

## Tech Stack

* **Frontend:** React 18, Vite, React Router v6, Bootstrap 5, Axios
* **Backend:** Node.js, Express.js
* **Database & ORM:** PostgreSQL, Prisma ORM
* **Auth:** JWT, Bcrypt
* **Container:** Docker, Docker Compose

---

## วิธีติดตั้งและรันโปรเจกต์

### สิ่งที่ต้องมีในเครื่อง
* Node.js (v18+)
* PostgreSQL (v14+) หรือ Docker

---

### วิธีที่ 1: รันแบบ Local บนเครื่อง (สำหรับ Dev)

#### 1. ตั้งค่าฐานข้อมูลและ `.env`
สร้างฐานข้อมูลใน PostgreSQL ชื่อ `psu_scholarship` แล้วสร้างไฟล์ `.env` ไว้ที่โฟลเดอร์ `POC_scholaship_server`:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:1234@localhost:5432/psu_scholarship?schema=public"
JWT_SECRET="psu-scholarship-jwt-secret-key-2026"

```

#### 2. รัน Server (Terminal 1)

```bash
cd POC_scholaship_server
npm install
npx prisma generate
npx prisma db push
node --env-file=.env prisma/seed.js
npm start

```

> Server จะรันที่ `http://localhost:5000` (พร้อม Mock Data 25 รายการ)

#### 3. รัน Client (Terminal 2)

```bash
cd POC_scholarship_system
npm install
npm run dev

```

> เปิดเว็บได้ที่ `http://localhost:3000` (หรือพอร์ตที่ Vite แจ้งใน Terminal)

---

### วิธีที่ 2: รันผ่าน Docker Compose

1. แก้ไข `DATABASE_URL` ใน `POC_scholaship_server/.env` ให้ชี้ไปที่ container:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:1234@postgres:5432/psu_scholarship?schema=public"
JWT_SECRET="psu-scholarship-jwt-secret-key-2026"

```

2. สั่งรัน container:

```bash
docker compose up --build -d

```

---

## บัญชีสำหรับทดสอบ (เจ้าหน้าที่)

* **Username:** `admin`
* **Password:** `admin1234`

---

## สรุป API Endpoints

### Auth

* `POST /api/auth/login` — เข้าสู่ระบบรับ JWT Token
* `POST /api/auth/register-admin` — สร้างบัญชีแอดมินใหม่ (Admin Only)

### คำขอทุน (Requests)

* `GET /api/requests` — ดึงรายการคำขอ (รองรับ query: `page`, `limit`, `search`, `status`, `typeId`)
* `POST /api/requests` — ส่งคำขอทุนใหม่
* `GET /api/requests/:id` — ดูรายละเอียดคำขอตาม ID
* `PUT /api/requests/:id` — แก้ไขข้อมูลคำขอ
* `PATCH /api/requests/:id/status` — อัปเดตสถานะคำขอ (`PENDING`, `APPROVED`, `REJECTED`)
* `DELETE /api/requests/:id` — ลบคำขอ (Soft Delete)

### ข้อมูลอื่นๆ & แดชบอร์ด

* `GET /api/scholarship-types` — รายการประเภททุนทั้งหมด
* `GET /api/requests/stats` — ข้อมูลสถิติสำหรับหน้า Dashboard

```

```