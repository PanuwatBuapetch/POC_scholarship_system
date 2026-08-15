import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminTable from '../components/AdminTable';
import RequestModal from '../components/RequestModal';
import Dashboard from '../components/Dashboard';

export default function AdminPage() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [types, setTypes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [activeTab, setActiveTab] = useState('table');
  
  // State ควบคุม Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // ดึงรายการประเภททุน
  const fetchTypes = async () => {
    try {
      const res = await axios.get('/api/scholarship-types');
      setTypes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ดึงข้อมูลสถิติ
  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/requests/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ดึงรายการคำขอ
  const fetchRequests = async () => {
    try {
      const params = {
        page,
        limit: 10,
        search,
        status: statusFilter,
        typeId: typeFilter,
      };
      const res = await axios.get('/api/requests', { params });
      setRequests(res.data.data);
      setTotalPages(res.data.meta.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTypes();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [page, search, statusFilter, typeFilter]);

  // 1. เปลี่ยนสถานะคำขอ
  const handleStatusChange = async (id, status, remark) => {
    try {
      await axios.patch(`/api/requests/${id}/status`, { status, remark });
      alert('🎉 บันทึกการเปลี่ยนสถานะคำขอทุนเรียบร้อยแล้ว!');
      fetchRequests();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.error || 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
    }
  };

  // 2. บันทึกการเพิ่ม / แก้ไขข้อมูลจาก Modal
  const handleSaveRequest = async (formData) => {
    console.log('💾 AdminPage received formData:', formData);
    try {
      let successMessage = '';
      if (formData.id) {
        // แก้ไข
        console.log('🔄 Updating request with ID:', formData.id);
        await axios.put(`/api/requests/${formData.id}`, formData);
        successMessage = '🎉 บันทึกการแก้ไขข้อมูลคำขอทุนสำเร็จเรียบร้อยแล้ว!';
      } else {
        // เพิ่มใหม่
        console.log('✨ Creating new request');
        await axios.post('/api/requests', formData);
        successMessage = '🎉 เพิ่มคำขอทุนใหม่สำเร็จเรียบร้อยแล้ว!';
      }
      
      // รอเวลาเล็กน้อยเพื่อให้แน่ใจว่าข้อมูลบันทึกแล้ว
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // ดึงข้อมูลใหม่เพื่อให้ตารางอัปเดตแสดงข้อมูลล่าสุด
      await fetchRequests();
      await fetchStats();
      
      // แสดงข้อความสำเร็จ
      alert(successMessage);
      // ปิด Modal หลังจากแสดงข้อความสำเร็จ
      setIsModalOpen(false);
      setSelectedRequest(null);
    } catch (err) {
      alert(err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      throw err; // ให้ RequestModal รู้ว่าเกิดข้อผิดพลาด
    }
  };

  // 3. ลบคำขอทุน (Soft Delete)
  const handleDeleteRequest = async (id) => {
    try {
      await axios.delete(`/api/requests/${id}`);
      alert('🗑️ ลบรายการคำขอทุนเรียบร้อยแล้ว (Soft Delete)');
      setIsModalOpen(false);
      setSelectedRequest(null);
      fetchRequests();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.error || 'เกิดข้อผิดพลาดในการลบคำขอ');
    }
  };

  return (
    <div className="container-fluid py-4 px-md-5">
      {/* ส่วนหัว Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">ระบบบริหารจัดการคำขอทุนการศึกษา</h4>
          <p className="text-muted small mb-0">กองพัฒนานักศึกษาและศิษย์เก่าสัมพันธ์ มหาวิทยาลัยสงขลานครินทร์</p>
        </div>

        <div className="d-flex gap-2">
          <div className="btn-group">
            <button
              onClick={() => setActiveTab('table')}
              className={`btn btn-sm ${activeTab === 'table' ? 'btn-primary fw-bold' : 'btn-outline-primary'}`}
            >
              📋 รายการคำขอทุน
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`btn btn-sm ${activeTab === 'dashboard' ? 'btn-primary fw-bold' : 'btn-outline-primary'}`}
            >
              📊 แดชบอร์ดสรุปภาพรวม
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedRequest(null);
              setIsModalOpen(true);
            }}
            className="btn btn-sm btn-success fw-bold"
          >
            + เพิ่มคำขอทุนใหม่
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <Dashboard stats={stats} />
      ) : (
        <>
          {/* ช่องค้นหา & กรอง */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-3">
              <div className="row g-3">
                <div className="col-md-5">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="🔍 ค้นหาด้วยรหัสนักศึกษา, ชื่อ-นามสกุล, เลขที่คำขอ..."
                    className="form-control form-control-sm"
                  />
                </div>
                <div className="col-md-4">
                  <select
                    value={typeFilter}
                    onChange={(e) => {
                      setTypeFilter(e.target.value);
                      setPage(1);
                    }}
                    className="form-select form-select-sm"
                  >
                    <option value="">-- กรองทุกประเภททุน --</option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="form-select form-select-sm"
                  >
                    <option value="">-- กรองทุกสถานะ --</option>
                    <option value="PENDING">รอพิจารณา</option>
                    <option value="APPROVED">อนุมัติแล้ว</option>
                    <option value="REJECTED">ไม่อนุมัติ</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ตารางแสดงผล */}
          <AdminTable
            requests={requests}
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
            onEdit={(item) => {
              setSelectedRequest(item);
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteRequest}
            onStatusChange={handleStatusChange}
          />
        </>
      )}

      {/* Modal Popup (ส่ง Props ครบถ้วน) */}
      <RequestModal
        isOpen={isModalOpen}
        request={selectedRequest}
        scholarshipTypes={types}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequest(null);
        }}
        onSave={handleSaveRequest}
        onDelete={handleDeleteRequest}
      />
    </div>
  );
}