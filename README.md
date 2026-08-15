นี่คือเนื้อหาสำหรับไฟล์ **`README.md`** ฉบับสมบูรณ์ที่จัดโครงสร้างตามเกณฑ์มาตรฐาน มีครบทั้งสถาปัตยกรรมระบบ รายละเอียด API บัญชีทดสอบ และคำสั่งรันด้วย Docker Compose แบบคำสั่งเดียวจบ สามารถคัดลอกไปวางในไฟล์ `README.md` ที่ Root โฟลเดอร์ของโปรเจกต์ได้ทันทีครับ:

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
| **Frontend** | React, React Router v6, Bootstrap 5, Axios |
| **Backend API** | Node.js, Express.js (RESTful API), JWT, Bcrypt |
| **Database & ORM** | PostgreSQL, Prisma ORM |
| **Containerization** | Docker, Docker Compose |

---

## 🚀 วิธีการติดตั้งและรันโปรเจกต์ (Quick Start with Docker)

ระบบรองรับการรันแบบ **One-Command Setup** ผ่าน Docker Compose โดยจะทำการ Start ทั้ง Database (PostgreSQL), Backend API และ Frontend พร้อมรัน Script หยอดข้อมูลตั้งต้น (Seed Data) โดยอัตโนมัติ

### 1. โคลน Repository
```bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_PROJECT_FOLDER>

```

### 2. สั่งรันระบบด้วย Docker Compose

```bash
docker compose up --build

```

*(กรณีต้องการรันเป็น Background Process ให้ใส่ `-d` ต่อท้าย: `docker compose up --build -d`)*

### 3. เข้าใช้งานระบบ

* **หน้านักศึกษายื่นคำขอทุน:** [http://localhost:3000](http://localhost:3000)
* **หน้าจัดการสำหรับเจ้าหน้าที่:** [http://localhost:3000/login](http://localhost:3000/login)
* **Backend RESTful API:** [http://localhost:5000](http://localhost:5000)

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

---

## 🛑 คำสั่งหยุดการทำงาน (Stop Services)

```bash
docker compose down

```

*(หากต้องการลบ Volume ฐานข้อมูลเพื่อเริ่มใหม่ทั้งหมด: `docker compose down -v`)*

```

```