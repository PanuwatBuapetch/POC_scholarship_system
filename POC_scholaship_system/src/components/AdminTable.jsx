import React, { useState } from 'react';

export default function AdminTable({
  requests,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  // State สำหรับควบคุม Popup เปลี่ยนสถานะ
  const [selectedItem, setSelectedItem] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [remark, setRemark] = useState('');

  // ฟังก์ชัน Masking เลขบัญชี (123-x-xx789-0)
  const maskAccount = (accNo) => {
    if (!accNo) return '-';
    return accNo.replace(/^(\d{3})-\d{1}-\d{2}(\d{3}-\d{1})$/, '$1-x-xx$2');
  };

  // สไตล์ Badge ตามสถานะ
  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">อนุมัติแล้ว</span>;
      case 'REJECTED':
        return <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">ไม่อนุมัติ</span>;
      default:
        return <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1">รอพิจารณา</span>;
    }
  };

  // เปิด Popup เปลี่ยนสถานะ
  const handleOpenStatusModal = (item) => {
    setSelectedItem(item);
    setNewStatus(item.status);
    setRemark(item.remark || '');
  };

  // ยืนยันการเปลี่ยนสถานะ
  const handleConfirmStatus = (e) => {
    e.preventDefault();
    if (selectedItem) {
      onStatusChange(selectedItem.id, newStatus, remark);
      setSelectedItem(null);
    }
  };

  // ยืนยันการลบแบบ Soft Delete
  const handleDeleteClick = (id) => {
    if (window.confirm('คุณยืนยันที่จะลบคำขอทุนการศึกษานี้ใช่หรือไม่? (Soft Delete)')) {
      onDelete(id);
    }
  };

  return (
    <>
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-secondary small">
                <th>เลขที่คำขอ</th>
                <th>ชื่อ - รหัสนักศึกษา</th>
                <th>ประเภททุน</th>
                <th>จำนวนเงิน (บาท)</th>
                <th>เลขบัญชี</th>
                <th>สถานะ</th>
                <th>วันที่ยื่น</th>
                <th className="text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    ไม่พบข้อมูลคำขอทุน
                  </td>
                </tr>
              ) : (
                requests.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-bold text-primary font-monospace">{item.requestNo}</td>
                    <td>
                      <div className="fw-semibold">{item.fullName}</div>
                      <div className="text-muted small">
                        {item.studentId} ({item.faculty})
                      </div>
                    </td>
                    <td>{item.scholarshipType?.name}</td>
                    <td>{Number(item.requestedAmount).toLocaleString()}</td>
                    <td className="font-monospace text-muted">{maskAccount(item.bankAccountNo)}</td>
                    <td>
                      {/* ปุ่มคลิกเพื่อเปิด Popup เปลี่ยนสถานะ */}
                      <button
                        type="button"
                        onClick={() => handleOpenStatusModal(item)}
                        className="btn btn-sm p-0 d-flex align-items-center gap-1 text-decoration-none"
                        title="คลิกเพื่อเปลี่ยนสถานะ"
                      >
                        {getStatusBadge(item.status)}
                        <span className="text-muted small">⚙️</span>
                      </button>
                    </td>
                    <td className="text-muted small">
                      {new Date(item.createdAt).toLocaleDateString('th-TH')}
                    </td>
                    <td className="text-center">
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="btn btn-outline-primary"
                        >
                          แก้ไข
                        </button>
                        {item.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(item.id)}
                            className="btn btn-outline-danger"
                          >
                            ลบ
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
          <span className="text-muted small">
            หน้า {page} จาก {totalPages || 1}
          </span>
          <div className="btn-group btn-group-sm">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
              className="btn btn-outline-secondary"
            >
              ก่อนหน้า
            </button>
            <button
              type="button"
              disabled={page === totalPages || totalPages === 0}
              onClick={() => onPageChange(page + 1)}
              className="btn btn-outline-secondary"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>

      {/* ================= Modal Popup เปลี่ยนสถานะ ================= */}
      {selectedItem && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1060,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div className="card shadow-lg border-0 w-100" style={{ maxWidth: '500px' }}>
            <div className="card-header bg-dark text-white p-3 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold">⚙️ พิจารณา / เปลี่ยนสถานะคำขอทุน</h6>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setSelectedItem(null)}
              ></button>
            </div>

            <form onSubmit={handleConfirmStatus}>
              <div className="card-body p-4 space-y-3">
                <div className="p-3 bg-light rounded mb-3">
                  <div className="small text-muted">เลขที่คำขอ: <span className="fw-bold text-primary font-monospace">{selectedItem.requestNo}</span></div>
                  <div className="fw-bold">{selectedItem.fullName} ({selectedItem.studentId})</div>
                  <div className="small text-muted">{selectedItem.scholarshipType?.name} - {Number(selectedItem.requestedAmount).toLocaleString()} บาท</div>
                </div>

                <div className="mb-3">
                  <label className="form-label font-semibold small">เลือกสถานะใหม่ *</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="PENDING">⏳ รอพิจารณา (PENDING)</option>
                    <option value="APPROVED">✅ อนุมัติ (APPROVED)</option>
                    <option value="REJECTED">❌ ไม่อนุมัติ (REJECTED)</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label font-semibold small">หมายเหตุประกอบการพิจารณา</label>
                  <textarea
                    rows="3"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    className="form-control text-sm"
                    placeholder="ระบุเหตุผลหรือข้อคิดเห็นของคณะกรรมการ (ถ้ามี)..."
                  ></textarea>
                </div>
              </div>

              <div className="card-footer bg-white d-flex justify-content-end gap-2 p-3 border-top">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="btn btn-secondary btn-sm px-3 fw-bold"
                >
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary btn-sm px-4 fw-bold">
                  บันทึกสถานะ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}