const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // 1. Seed บัญชีเจ้าหน้าที่ Admin (admin / admin1234)
  const hashedPassword = await bcrypt.hash('admin1234', 10);
  // Admin คนที่ 1
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password: hashedPassword },
    create: {
      username: 'admin',
      password: hashedPassword,
      fullName: 'เจ้าหน้าที่สวัสดิการและทุนการศึกษา (1)',
    },
  });

  // Admin คนที่ 2 (เพิ่มบรรทัดนี้)
  await prisma.user.upsert({
    where: { username: 'admin2' },
    update: { password: hashedPassword },
    create: {
      username: 'admin2',
      password: hashedPassword,
      fullName: 'เจ้าหน้าที่สวัสดิการและทุนการศึกษา (2)',
    },
  });



  // 2. Seed ประเภททุน 5 ประเภทตามโจทย์ ข้อ 3.3
  const types = [
    'ทุนขาดแคลนทุนทรัพย์',
    'ทุนส่งเสริมการศึกษา (เรียนดี)',
    'ทุนทำงานพิเศษ (นักศึกษาช่วยงาน)',
    'ทุนฉุกเฉิน/ช่วยเหลือกรณีพิเศษ',
    'ทุนกิจกรรมนักศึกษา',
  ];

  for (const name of types) {
    await prisma.scholarshipType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // 3. Seed คำขอทุนตัวอย่าง 25 รายการตามโจทย์ ข้อ 3.5
  const faculties = ['วิศวกรรมศาสตร์', 'วิทยาศาสตร์', 'วิทยาการจัดการ', 'พยาบาลศาสตร์', 'ศิลปศาสตร์'];
  const statuses = ['PENDING', 'APPROVED', 'REJECTED'];

  for (let i = 1; i <= 25; i++) {
    const typeId = (i % 5) + 1;
    const status = statuses[i % 3];
    const reqNo = `REQ-2026-${String(i).padStart(4, '0')}`;

    await prisma.scholarshipRequest.upsert({
      where: { requestNo: reqNo },
      update: {},
      create: {
        requestNo: reqNo,
        studentId: `6610210${String(i).padStart(3, '0')}`,
        fullName: `นักศึกษา ตัวอย่างที่ ${i}`,
        faculty: faculties[i % faculties.length],
        academicYearLevel: (i % 4) + 1,
        gpax: parseFloat((2.5 + (i % 15) * 0.1).toFixed(2)),
        email: `student${i}@psu.ac.th`,
        scholarshipTypeId: typeId,
        requestedAmount: 5000 + i * 500,
        bankAccountNo: `123-4-${String(i).padStart(5, '0')}-7`,
        reason: `มีความจำเป็นต้องขอรับทุนการศึกษาเพื่อสนับสนุนค่าใช้จ่าย`,
        pdpaConsent: true,
        status: status,
        remark: status === 'REJECTED' ? 'เอกสารแนบไม่ครบถ้วน' : status === 'APPROVED' ? 'อนุมัติเรียบร้อย' : null,
      },
    });
  }
  console.log('🌱 Seed Data 25 รายการสำเร็จเรียบร้อย!');
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });