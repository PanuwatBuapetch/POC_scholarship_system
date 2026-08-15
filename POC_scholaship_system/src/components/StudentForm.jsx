import React, { useState } from 'react';

export default function StudentForm({ scholarshipTypes, onSubmitSuccess }) {
  const [formData, setFormData] = useState({
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
    pdpaConsent: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [message, setMessage] = useState(null);

  // ตรวจสอบความถูกต้องของแต่ละช่อง
  const validate = (data) => {
    const errs = {};

    if (!data.studentId.trim()) {
      errs.studentId = 'กรุณากรอกรหัสนักศึกษา';
    } else if (!/^\d{10}$/.test(data.studentId.trim())) {
      errs.studentId = 'รหัสนักศึกษาต้องเป็นตัวเลข 10 หลัก';
    }

    if (!data.fullName.trim()) errs.fullName = 'กรุณากรอกชื่อ - นามสกุล';
    if (!data.faculty.trim()) errs.faculty = 'กรุณากรอกคณะ/สาขา';

    if (data.gpax === '' || data.gpax === null) {
      errs.gpax = 'กรุณากรอกเกรดเฉลี่ย (GPAX)';
    } else if (Number(data.gpax) < 0 || Number(data.gpax) > 4.0) {
      errs.gpax = 'เกรดเฉลี่ยต้องอยู่ระหว่าง 0.00 - 4.00';
    }

    if (!data.email.trim()) {
      errs.email = 'กรุณากรอกอีเมล';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errs.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (!data.scholarshipTypeId) errs.scholarshipTypeId = 'กรุณาเลือกประเภททุนการศึกษา';

    if (!data.requestedAmount) {
      errs.requestedAmount = 'กรุณากรอกจำนวนเงินที่ขอ';
    } else if (Number(data.requestedAmount) <= 0) {
      errs.requestedAmount = 'จำนวนเงินที่ขอต้องมากกว่า 0 บาท';
    }

    if (!data.bankAccountNo.trim()) errs.bankAccountNo = 'กรุณากรอกเลขที่บัญชีธนาคาร';
    if (!data.reason.trim()) errs.reason = 'กรุณากรอกเหตุผลความจำเป็นในการขอรับทุน';
    if (!data.pdpaConsent) errs.pdpaConsent = 'กรุณาติ๊กยินยอมการเก็บและใช้ข้อมูลส่วนบุคคล (PDPA)';

    return errs;
  };

  const handleChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);

    // หากเคยกดส่งไปแล้วและมีข้อผิดพลาด ให้ตรวจซ้ำแบบเรียลไทม์เพื่อปลดสีแดงออกเมื่อกรอกถูก
    if (isSubmitted) {
      setErrors(validate(updatedData));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setMessage(null);
      const firstErrorField = Object.keys(validationErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (onSubmitSuccess) onSubmitSuccess(formData);

    setMessage('🎉 ยื่นคำขอทุนการศึกษาสำเร็จเรียบร้อยแล้ว! สถานะคำขอ: รอพิจารณา');
    setFormData({
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
      pdpaConsent: false,
    });
    setErrors({});
    setIsSubmitted(false);
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-9">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-primary text-white p-3">
            <h5 className="mb-0 fw-bold">แบบฟอร์มยื่นคำขอทุนการศึกษา (สำหรับนักศึกษา)</h5>
          </div>
          <div className="card-body p-4">
            {message && <div className="alert alert-success fw-semibold mb-4">{message}</div>}

            {/* กล่องแจ้งเตือนรวม จะแสดงเฉพาะตอนที่กด "ส่งคำขอ" แล้วเท่านั้น */}
            {isSubmitted && Object.keys(errors).length > 0 && (
              <div className="alert alert-danger fw-semibold mb-4">
                ⚠️ กรุณากรอกข้อมูลให้ถูกต้องครบถ้วน ({Object.keys(errors).length} รายการที่ต้องแก้ไข)
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Row 1: รหัสนักศึกษา & ชื่อ-นามสกุล */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label font-semibold">รหัสนักศึกษา *</label>
                  <input
                    id="studentId"
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => handleChange('studentId', e.target.value)}
                    className={`form-control ${isSubmitted && errors.studentId ? 'is-invalid' : ''}`}
                    placeholder="เช่น 6610210001"
                  />
                  {isSubmitted && errors.studentId && (
                    <div className="invalid-feedback">{errors.studentId}</div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label font-semibold">ชื่อ - นามสกุล *</label>
                  <input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className={`form-control ${isSubmitted && errors.fullName ? 'is-invalid' : ''}`}
                    placeholder="เช่น นายสมชาย ใจดี"
                  />
                  {isSubmitted && errors.fullName && (
                    <div className="invalid-feedback">{errors.fullName}</div>
                  )}
                </div>
              </div>

              {/* Row 2: คณะ/สาขา, ชั้นปี & เกรดเฉลี่ย */}
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label font-semibold">คณะ/สาขา *</label>
                  <input
                    id="faculty"
                    type="text"
                    value={formData.faculty}
                    onChange={(e) => handleChange('faculty', e.target.value)}
                    className={`form-control ${isSubmitted && errors.faculty ? 'is-invalid' : ''}`}
                    placeholder="เช่น วิศวกรรมศาสตร์"
                  />
                  {isSubmitted && errors.faculty && (
                    <div className="invalid-feedback">{errors.faculty}</div>
                  )}
                </div>

                <div className="col-md-4">
                  <label className="form-label font-semibold">ชั้นปี *</label>
                  <select
                    id="academicYearLevel"
                    value={formData.academicYearLevel}
                    onChange={(e) => handleChange('academicYearLevel', Number(e.target.value))}
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
                    id="gpax"
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.00"
                    value={formData.gpax}
                    onChange={(e) => handleChange('gpax', e.target.value)}
                    className={`form-control ${isSubmitted && errors.gpax ? 'is-invalid' : ''}`}
                    placeholder="0.00 - 4.00"
                  />
                  {isSubmitted && errors.gpax && (
                    <div className="invalid-feedback">{errors.gpax}</div>
                  )}
                </div>
              </div>

              {/* Row 3: อีเมล & ประเภททุน */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label font-semibold">อีเมล (PSU Email) *</label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`form-control ${isSubmitted && errors.email ? 'is-invalid' : ''}`}
                    placeholder="student@psu.ac.th"
                  />
                  {isSubmitted && errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label font-semibold">ประเภททุน *</label>
                  <select
                    id="scholarshipTypeId"
                    value={formData.scholarshipTypeId}
                    onChange={(e) => handleChange('scholarshipTypeId', e.target.value)}
                    className={`form-select ${isSubmitted && errors.scholarshipTypeId ? 'is-invalid' : ''}`}
                  >
                    <option value="">-- เลือกประเภททุน --</option>
                    {scholarshipTypes?.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  {isSubmitted && errors.scholarshipTypeId && (
                    <div className="invalid-feedback">{errors.scholarshipTypeId}</div>
                  )}
                </div>
              </div>

              {/* Row 4: จำนวนเงิน & เลขบัญชี */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label font-semibold">จำนวนเงินที่ขอ (บาท) *</label>
                  <input
                    id="requestedAmount"
                    type="number"
                    min="1"
                    value={formData.requestedAmount}
                    onChange={(e) => handleChange('requestedAmount', e.target.value)}
                    className={`form-control ${isSubmitted && errors.requestedAmount ? 'is-invalid' : ''}`}
                    placeholder="เช่น 10000"
                  />
                  {isSubmitted && errors.requestedAmount && (
                    <div className="invalid-feedback">{errors.requestedAmount}</div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label font-semibold">เลขที่บัญชีธนาคาร *</label>
                  <input
                    id="bankAccountNo"
                    type="text"
                    value={formData.bankAccountNo}
                    onChange={(e) => handleChange('bankAccountNo', e.target.value)}
                    className={`form-control ${isSubmitted && errors.bankAccountNo ? 'is-invalid' : ''}`}
                    placeholder="123-4-56789-0"
                  />
                  {isSubmitted && errors.bankAccountNo && (
                    <div className="invalid-feedback">{errors.bankAccountNo}</div>
                  )}
                </div>
              </div>

              {/* Row 5: เหตุผล */}
              <div className="mb-3">
                <label className="form-label font-semibold">เหตุผลความจำเป็นในการขอรับทุน *</label>
                <textarea
                  id="reason"
                  rows="3"
                  value={formData.reason}
                  onChange={(e) => handleChange('reason', e.target.value)}
                  className={`form-control ${isSubmitted && errors.reason ? 'is-invalid' : ''}`}
                  placeholder="อธิบายเหตุผลความจำเป็น..."
                ></textarea>
                {isSubmitted && errors.reason && (
                  <div className="invalid-feedback">{errors.reason}</div>
                )}
              </div>

              {/* Row 6: PDPA Checkbox */}
              <div className={`p-3 rounded mb-3 border ${isSubmitted && errors.pdpaConsent ? 'border-danger bg-danger-subtle' : 'bg-light'}`}>
                <div className="form-check">
                  <input
                    id="pdpaConsent"
                    type="checkbox"
                    checked={formData.pdpaConsent}
                    onChange={(e) => handleChange('pdpaConsent', e.target.checked)}
                    className={`form-check-input ${isSubmitted && errors.pdpaConsent ? 'is-invalid' : ''}`}
                  />
                  <label className="form-check-label text-secondary small" htmlFor="pdpaConsent">
                    ข้าพเจ้ายินยอมให้จัดเก็บ ใช้ และเปิดเผยข้อมูลส่วนบุคคลที่ปรากฏในแบบฟอร์มนี้ เพื่อประโยชน์ในการพิจารณาจัดสรรทุนการศึกษาตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)
                  </label>
                  {isSubmitted && errors.pdpaConsent && (
                    <div className="text-danger small mt-1">{errors.pdpaConsent}</div>
                  )}
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2 fw-bold">
                ส่งคำขอทุนการศึกษา
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}