import React, { useState, useEffect } from 'react';

export default function RequestModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  request,
  scholarshipTypes,
}) {
  const [formData, setFormData] = useState({
    id: '',
    studentId: '',
    fullName: '',
    faculty: '',
    academicYearLevel: 1,
    gpax: '',
    email: '',
    scholarshipTypeId: '',
    requestedAmount: '',
    bankAccountNo: '',
    reason: '',
    remark: '',
    status: 'PENDING',
    pdpaConsent: true,
  });

  const formatBankAccount = (value) => {
    if (!value) return '';
    const numbers = String(value).replace(/\D/g, '').slice(0, 10);
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}-${numbers.slice(3, 4)}-${numbers.slice(4)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 4)}-${numbers.slice(4, 9)}-${numbers.slice(9, 10)}`;
  };

  useEffect(() => {
    if (request) {
      setFormData({
        id: request.id || '',
        studentId: request.studentId || '',
        fullName: request.fullName || '',
        faculty: request.faculty || '',
        academicYearLevel: request.academicYearLevel || 1,
        gpax: request.gpax !== undefined ? request.gpax : '',
        email: request.email || '',
        scholarshipTypeId: request.scholarshipTypeId || (scholarshipTypes?.[0]?.id || ''),
        requestedAmount: request.requestedAmount !== undefined ? request.requestedAmount : '',
        bankAccountNo: request.bankAccountNo || '',
        reason: request.reason || '',
        remark: request.remark || '',
        status: request.status || 'PENDING',
        pdpaConsent: request.pdpaConsent ?? true,
      });
    } else {
      setFormData({
        id: '',
        studentId: '',
        fullName: '',
        faculty: '',
        academicYearLevel: 1,
        gpax: '',
        email: '',
        scholarshipTypeId: scholarshipTypes?.[0]?.id || '',
        requestedAmount: '',
        bankAccountNo: '',
        reason: '',
        remark: '',
        status: 'PENDING',
        pdpaConsent: true,
      });
    }
  }, [request, isOpen, scholarshipTypes]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // เช็กค่าว่างเบื้องต้น
    if (!formData.studentId || !formData.fullName || !formData.faculty) {
      alert('กรุณากรอกข้อมูล รหัสนักศึกษา, ชื่อ-นามสกุล และคณะ ให้ครบถ้วน');
      return;
    }

    const gpaxNum = parseFloat(formData.gpax);
    if (isNaN(gpaxNum) || gpaxNum < 0 || gpaxNum > 4.0) {
      alert('กรุณากรอกเกรดเฉลี่ย (GPAX) ระหว่าง 0.00 - 4.00');
      return;
    }

    const amountNum = parseFloat(formData.requestedAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('จำนวนเงินที่ขอต้องมากกว่า 0 บาท');
      return;
    }

    // ส่งค่าไปบันทึก และรอ Promise ตอบกลับ
    try {
      if (onSave) {
        const dataToSave = {
          ...formData,
          academicYearLevel: Number(formData.academicYearLevel),
          gpax: gpaxNum,
          requestedAmount: amountNum,
          scholarshipTypeId: Number(formData.scholarshipTypeId),
        };
        console.log('📝 Sending data to save:', dataToSave);
        await onSave(dataToSave);
        // AdminPage จะ handle การปิด Modal หลังจากบันทึกสำเร็จ
      }
    } catch (error) {
      console.error('Save error:', error);
      // Error message แสดงจาก AdminPage แล้ว
    }
  };

  const handleDeleteClick = () => {
    if (formData.status && formData.status !== 'PENDING') {
      alert('อนุญาตให้ลบได้เฉพาะคำขอที่อยู่ในสถานะ "รอพิจารณา" เท่านั้น');
      return;
    }

    if (window.confirm('คุณยืนยันที่จะลบคำขอทุนการศึกษานี้ใช่หรือไม่? (Soft Delete)')) {
      if (onDelete && request?.id) {
        onDelete(request.id);
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="card shadow-lg border-0 w-100"
        style={{ maxWidth: '700px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="card-header bg-primary text-white p-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">
            {request && request.id ? 'แก้ไขข้อมูลคำขอทุน (เจ้าหน้าที่)' : 'เพิ่มคำขอทุนใหม่ (โดยเจ้าหน้าที่)'}
          </h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>

        <div className="card-body p-4" style={{ overflowY: 'auto' }}>
          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label font-semibold">รหัสนักศึกษา *</label>
                <input
                  type="text"
                  maxLength="10"
                  value={formData.studentId}
                  onChange={(e) =>
                    setFormData({ ...formData, studentId: e.target.value.replace(/\D/g, '') })
                  }
                  className="form-control"
                  placeholder="เช่น 6610210001"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label font-semibold">ชื่อ - นามสกุล *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="form-control"
                  placeholder="เช่น นายสมชาย ใจดี"
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label font-semibold">คณะ/สาขา *</label>
                <input
                  type="text"
                  value={formData.faculty}
                  onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                  className="form-control"
                  placeholder="เช่น วิศวกรรมศาสตร์"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label font-semibold">ชั้นปี *</label>
                <select
                  value={formData.academicYearLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, academicYearLevel: Number(e.target.value) })
                  }
                  className="form-select"
                >
                  {[1, 2, 3, 4, 5, 6].map((y) => (
                    <option key={y} value={y}>
                      ชั้นปีที่ {y}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label font-semibold">เกรดเฉลี่ย (GPAX) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.00"
                  value={formData.gpax}
                  onChange={(e) => setFormData({ ...formData, gpax: e.target.value })}
                  className="form-control"
                  placeholder="0.00 - 4.00"
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label font-semibold">อีเมล (PSU Email) *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-control"
                  placeholder="student@psu.ac.th"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label font-semibold">ประเภททุน *</label>
                <select
                  value={formData.scholarshipTypeId}
                  onChange={(e) =>
                    setFormData({ ...formData, scholarshipTypeId: e.target.value })
                  }
                  className="form-select"
                >
                  <option value="">-- เลือกประเภททุน --</option>
                  {scholarshipTypes?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label font-semibold">จำนวนเงินที่ขอ (บาท) *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.requestedAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, requestedAmount: e.target.value })
                  }
                  className="form-control"
                  placeholder="เช่น 10000"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label font-semibold">เลขที่บัญชีธนาคาร *</label>
                <input
                  type="text"
                  maxLength="13"
                  value={formData.bankAccountNo}
                  onChange={(e) =>
                    setFormData({ ...formData, bankAccountNo: formatBankAccount(e.target.value) })
                  }
                  className="form-control font-monospace"
                  placeholder="123-4-56789-0"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label font-semibold">เหตุผลความจำเป็นในการขอรับทุน *</label>
              <textarea
                rows="3"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="form-control"
                placeholder="ระบุเหตุผลความจำเป็น..."
              ></textarea>
            </div>

            <div className="mb-3">
              <label className="form-label font-semibold">หมายเหตุเพิ่มเติม (สำหรับเจ้าหน้าที่)</label>
              <textarea
                rows="2"
                value={formData.remark}
                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                className="form-control"
                placeholder="กรอกหมายเหตุการพิจารณา (ถ้ามี)"
              ></textarea>
            </div>

            <div className="d-flex justify-content-between align-items-center pt-3 border-top">
              <div>
                {request && request.id && (
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="btn btn-outline-danger fw-bold"
                  >
                    ลบคำขอทุน
                  </button>
                )}
              </div>
              <div className="d-flex gap-2">
                <button type="button" onClick={onClose} className="btn btn-secondary fw-bold">
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary fw-bold">
                  {request && request.id ? 'บันทึกการเปลี่ยนแปลง' : 'บันทึกคำขอใหม่'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}