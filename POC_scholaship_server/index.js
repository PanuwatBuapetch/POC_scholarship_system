require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'psu-scholarship-jwt-secret-key-2026';

// Middleware
app.use(cors());
app.use(express.json());

// ==========================================
// 1. AUTHENTICATION
// ==========================================

// POST: เข้าสู่ระบบ Admin
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(400).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, fullName: user.fullName },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: { username: user.username, fullName: user.fullName },
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
});

// POST: เพิ่มบัญชี Admin
app.post('/api/auth/register-admin', async (req, res) => {
  try {
    const { username, password, fullName } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'กรุณากรอก username และ password' });
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'ชื่อผู้ใช้งานนี้มีอยู่ในระบบแล้ว' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        fullName: fullName || 'เจ้าหน้าที่สวัสดิการ',
      },
    });

    res.status(201).json({
      message: 'สร้างบัญชี Admin สำเร็จ',
      user: { username: newAdmin.username, fullName: newAdmin.fullName },
    });
  } catch (err) {
    console.error('Register Admin Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างบัญชี Admin' });
  }
});

// ==========================================
// 2. MASTER DATA
// ==========================================

// GET: ดึงประเภททุนทั้งหมด
app.get('/api/scholarship-types', async (req, res) => {
  try {
    const types = await prisma.scholarshipType.findMany({
      orderBy: { id: 'asc' },
    });
    res.json(types);
  } catch (err) {
    console.error('Get Scholarship Types Error:', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลประเภททุนได้' });
  }
});

// ==========================================
// 3. STATS & DASHBOARD
// ==========================================

// GET: สรุปสถิติสำหรับ Dashboard
app.get('/api/requests/stats', async (req, res) => {
  try {
    const where = { deletedAt: null };

    const [totalCount, pendingCount, approvedCount, rejectedCount, scholarshipTypes, requests] =
      await Promise.all([
        prisma.scholarshipRequest.count({ where }),
        prisma.scholarshipRequest.count({ where: { ...where, status: 'PENDING' } }),
        prisma.scholarshipRequest.count({ where: { ...where, status: 'APPROVED' } }),
        prisma.scholarshipRequest.count({ where: { ...where, status: 'REJECTED' } }),
        prisma.scholarshipType.findMany({ orderBy: { id: 'asc' } }),
        prisma.scholarshipRequest.findMany({
          where,
          select: { scholarshipTypeId: true, requestedAmount: true },
        }),
      ]);

    const byType = scholarshipTypes.map((type) => {
      const totalAmount = requests
        .filter((r) => r.scholarshipTypeId === type.id)
        .reduce((sum, curr) => sum + Number(curr.requestedAmount || 0), 0);
      return {
        id: type.id,
        name: type.name,
        totalAmount,
      };
    });

    res.json({
      totalCount,
      pendingCount,
      approvedCount,
      rejectedCount,
      byType,
    });
  } catch (err) {
    console.error('Get Stats Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ' });
  }
});

// ==========================================
// 4. SCHOLARSHIP REQUESTS (CRUD)
// ==========================================

// POST: นักศึกษา / Admin ยื่นคำขอทุนใหม่
app.post('/api/requests', async (req, res) => {
  try {
    const {
      studentId,
      fullName,
      faculty,
      academicYearLevel,
      gpax,
      email,
      scholarshipTypeId,
      requestedAmount,
      bankAccountNo,
      reason,
      remark,
      pdpaConsent,
    } = req.body;

    if (!pdpaConsent) {
      return res.status(400).json({ error: 'ต้องยินยอมเงื่อนไข PDPA ก่อนยื่นคำขอ' });
    }

    const numGpax = parseFloat(gpax);
    if (isNaN(numGpax) || numGpax < 0 || numGpax > 4.0) {
      return res.status(400).json({ error: 'เกรดเฉลี่ยสะสม (GPAX) ต้องอยู่ระหว่าง 0.00 - 4.00' });
    }

    const numAmount = parseFloat(requestedAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'จำนวนเงินที่ขอรับทุนต้องมากกว่า 0 บาท' });
    }

    const count = await prisma.scholarshipRequest.count();
    const reqNo = `REQ-2026-${String(count + 1).padStart(4, '0')}`;

    const newRequest = await prisma.scholarshipRequest.create({
      data: {
        requestNo: reqNo,
        studentId: String(studentId).trim(),
        fullName: String(fullName).trim(),
        faculty: String(faculty).trim(),
        academicYearLevel: Number(academicYearLevel) || 1,
        gpax: numGpax,
        email: String(email).trim(),
        scholarshipTypeId: Number(scholarshipTypeId),
        requestedAmount: numAmount,
        bankAccountNo: String(bankAccountNo).trim(),
        reason: String(reason || '').trim(),
        remark: remark ? String(remark).trim() : null,
        pdpaConsent: Boolean(pdpaConsent),
        status: 'PENDING',
      },
      include: { scholarshipType: true },
    });

    res.status(201).json({ message: 'ยื่นคำขอทุนสำเร็จ', data: newRequest });
  } catch (err) {
    console.error('Create Request Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกคำขอทุน' });
  }
});

// GET: ดึงรายการคำขอทุน (Pagination, Filter, Search, Order By ID Ascending)
app.get('/api/requests', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const search = req.query.search ? String(req.query.search).trim() : '';
    const status = req.query.status ? String(req.query.status).trim() : '';
    const typeId = req.query.typeId ? Number(req.query.typeId) : null;

    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(status && { status }),
      ...(typeId && !isNaN(typeId) && { scholarshipTypeId: typeId }),
      ...(search && {
        OR: [
          { studentId: { contains: search, mode: 'insensitive' } },
          { fullName: { contains: search, mode: 'insensitive' } },
          { requestNo: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [totalItems, requests] = await Promise.all([
      prisma.scholarshipRequest.count({ where }),
      prisma.scholarshipRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'asc' }, // ล็อกลำดับตาม ID ให้คงที่ ไม่เด้งข้ามหน้าเวลา Update
        include: { scholarshipType: true },
      }),
    ]);

    res.json({
      data: requests,
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit) || 1,
      },
    });
  } catch (err) {
    console.error('Get Requests Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงรายการคำขอ' });
  }
});

// PUT: เจ้าหน้าที่แก้ไขข้อมูลคำขอทุน
app.put('/api/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      studentId,
      fullName,
      faculty,
      academicYearLevel,
      gpax,
      email,
      scholarshipTypeId,
      requestedAmount,
      bankAccountNo,
      reason,
      remark,
    } = req.body;

    const numGpax = parseFloat(gpax);
    if (isNaN(numGpax) || numGpax < 0 || numGpax > 4.0) {
      return res.status(400).json({ error: 'เกรดเฉลี่ย (GPAX) ต้องอยู่ระหว่าง 0.00 - 4.00' });
    }

    const numAmount = parseFloat(requestedAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'จำนวนเงินที่ขอต้องมากกว่า 0 บาท' });
    }

    const updated = await prisma.scholarshipRequest.update({
      where: { id },
      data: {
        studentId: String(studentId).trim(),
        fullName: String(fullName).trim(),
        faculty: String(faculty).trim(),
        academicYearLevel: Number(academicYearLevel) || 1,
        gpax: numGpax,
        email: String(email).trim(),
        scholarshipTypeId: Number(scholarshipTypeId),
        requestedAmount: numAmount,
        bankAccountNo: String(bankAccountNo).trim(),
        reason: String(reason || '').trim(),
        remark: remark ? String(remark).trim() : null,
      },
      include: { scholarshipType: true },
    });

    res.json({ message: 'แก้ไขข้อมูลสำเร็จ', data: updated });
  } catch (err) {
    console.error('Update Request Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล' });
  }
});

// PATCH: เปลี่ยนสถานะคำขอ (อนุมัติ / ไม่อนุมัติ)
app.patch('/api/requests/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remark } = req.body;

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'สถานะไม่ถูกต้อง' });
    }

    const updated = await prisma.scholarshipRequest.update({
      where: { id },
      data: {
        status,
        ...(remark !== undefined && { remark: remark ? String(remark).trim() : null }),
      },
      include: { scholarshipType: true },
    });

    res.json({ message: 'อัปเดตสถานะสำเร็จ', data: updated });
  } catch (err) {
    console.error('Update Status Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' });
  }
});

// DELETE: Soft Delete (ลบเฉพาะสถานะ PENDING)
app.delete('/api/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.scholarshipRequest.findUnique({
      where: { id },
    });

    if (!request || request.deletedAt) {
      return res.status(404).json({ error: 'ไม่พบรายการคำขอ' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: 'สามารถลบได้เฉพาะคำขอที่อยู่ในสถานะรอพิจารณาเท่านั้น' });
    }

    await prisma.scholarshipRequest.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({ message: 'ลบรายการคำขอสำเร็จ (Soft Delete)' });
  } catch (err) {
    console.error('Delete Request Error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบคำขอ' });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 RESTful API Server running on port ${PORT}`);
});