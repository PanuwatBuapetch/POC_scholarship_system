# ระบบบริหารจัดการคำขอทุนการศึกษา ม.อ. (Scholarship Request Management System)
> **ข้อสอบภาคปฏิบัติ (Proof of Concept : POC)**  
> ตำแหน่งนักวิชาการคอมพิวเตอร์ กองพัฒนานักศึกษาและศิษย์เก่าสัมพันธ์ สำนักงานอธิการบดี มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตหาดใหญ่

---

## 📌 เทคโนโลยีที่ใช้ในการพัฒนา (Tech Stack)

* **Frontend:** React.js (Vite), Bootstrap 5, Chart.js (`react-chartjs-2`), Axios
* **Backend:** Node.js, Express.js (RESTful API), JWT Authentication, Bcrypt.js
* **Database & ORM:** PostgreSQL 17, Prisma ORM
* **Containerization:** Docker, Docker Compose

---

## 🚀 ขั้นตอนการติดตั้งและรันระบบด้วย Docker (One-Command Setup)

ระบบได้รับการจัดทำ Container ผ่าน Docker Compose สามารถสั่งรันทั้ง **Frontend, Backend และ PostgreSQL** ได้ด้วยคำสั่งเดียวตามข้อกำหนด

### 1. การเตรียมความพร้อมก่อนรัน (Prerequisites)
* ติดตั้ง [Docker Desktop](https://www.docker.com/products/docker-desktop/) บนเครื่องคอมพิวเตอร์

### 2. คำสั่งสั่งรันระบบ
เปิด Terminal ในโฟลเดอร์หลักของโปรเจกต์ (`POC_scholarship_system`) แล้วรันคำสั่ง:

```bash
docker compose up --build

หมายเหตุ: ระบบจะทำการ Build Container, ติดตั้ง Dependencies, รัน Prisma Migration/Generate, และนำเข้าข้อมูลตัวอย่าง (Seed Data) ให้โดยอัตโนมัติ🌐 การเข้าใช้งานระบบ (Access URLs)ส่วนการใช้งานURLรายละเอียดหน้าสาธารณะ (นักศึกษา)http://localhost:3000ยื่นคำขอทุนการศึกษา (ไม่ต้องเข้าสู่ระบบ)หน้าจัดการ (เจ้าหน้าที่)http://localhost:3000/adminเข้าสู่ระบบเพื่อจัดการคำขอและดูแดชบอร์ดRESTful API Backendhttp://localhost:5000/apiAPI Server สำหรับการเชื่อมต่อข้อมูล🔑 บัญชีผู้ใช้สำหรับทดสอบระบบ (Test Credentials)เจ้าหน้าที่สามารถใช้บัญชีทดสอบด้านล่างนี้ในการเข้าสู่ระบบฝั่ง Admin:Username: adminPassword: admin1234📊 ข้อมูลตัวอย่างสำหรับทดสอบ (Seed Data)ระบบได้เตรียมข้อมูล Seed Data สำเร็จรูปไว้ล่วงหน้า ดังนี้:บัญชีเจ้าหน้าที่ Admin สำหรับเข้าสู่ระบบ (admin / admin1234)ประเภททุนการศึกษา 5 ประเภท ได้แก่:ทุนขาดแคลนทุนทรัพย์ทุนส่งเสริมการศึกษา (เรียนดี)ทุนทำงานพิเศษ (นักศึกษาช่วยงาน)ทุนฉุกเฉิน/ช่วยเหลือกรณีพิเศษทุนกิจกรรมนักศึกษาคำขอทุนตัวอย่างจำนวน 25 รายการ กระจายครบทุกประเภททุนและทุกสถานะ (รอพิจารณา, อนุมัติ, ไม่อนุมัติ) เพื่อทดสอบระบบ Pagination (10 รายการ/หน้า), ค้นหา, กรองข้อมูล และกราฟแสดงผลบน Dashboardหากต้องการรัน Seed Data ใหม่ด้วยตนเอง สามารถรันคำสั่งใน Container ได้ผ่าน:Bashdocker compose exec server node prisma/seed.js
📁 โครงสร้างโปรเจกต์ (Project Structure)PlaintextPOC_scholarship_system/
├── POC_scholaship_server/      # Backend (Node.js / Express / Prisma)
│   ├── prisma/
│   │   ├── schema.prisma       # Database Schema Definition
│   │   └── seed.js             # Seed Data (25 Requests + Admin User)
│   ├── Dockerfile
│   └── index.js
├── POC_scholaship_system/      # Frontend (React / Vite)
│   ├── src/
│   │   ├── components/         # AdminTable, Dashboard, RequestModal, StudentForm ฯลฯ
│   │   └── pages/              # PublicPage, AdminPage, LoginPage
│   ├── Dockerfile
│   └── vite.config.js
├── docker-compose.yml          # Docker Orchestration (Frontend + Backend + Postgres)
├── .env.example                # Example Environment Variables
└── README.md
✨ ฟีเจอร์เด่นของระบบ (Key Features)หน้ายื่นคำขอสำหรับนักศึกษา (Public Area):ระบบ Validation ข้อมูลแบบ Real-time (รหัสนักศึกษา 10 หลัก, รูปแบบ Email, GPAX 0.00-4.00, ยอดเงิน > 0)กล่องยินยอม PDPA Consent ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคลระบบจัดการสำหรับเจ้าหน้าที่ (Admin Area):ยืนยันตัวตนด้วย JWT Authenticationตารางคำขอพร้อมระบบแบ่งหน้า (Pagination) ครั้งละ 10 รายการระบบค้นหาและกรองคำขอตามประเภททุนและสถานะหน้าต่าง Modal สำหรับเพิ่ม/แก้ไขข้อมูลคำขอระบบ Soft Delete พร้อมการยืนยัน อนุญาตให้ลบได้เฉพาะคำขอสถานะ "รอพิจารณา" (PENDING) เท่านั้นแดชบอร์ดสรุปภาพรวม (Dashboard):การ์ดสรุปยอดคำขอทั้งหมดและยอดแยกตามสถานะแผนภูมิ Pie Chart สัดส่วนสถานะคำขอทุน และ Bar Chart แสดงยอดเงินรวมแยกตามประเภททุน