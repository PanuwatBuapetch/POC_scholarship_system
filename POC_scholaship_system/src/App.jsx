import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AdminTable from './components/AdminTable';
import Dashboard from './components/Dashboard';
import RequestModal from './components/RequestModal';
import StudentForm from './components/StudentForm';

// กำหนด Base URL ชี้ไปที่ Express Server (Port 5000)
axios.defaults.baseURL = 'http://localhost:5000';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <Link to="/" className="navbar-brand fw-bold">
            🎓 ระบบทุนการศึกษา ม.อ.
          </Link>
          <div className="d-flex align-items-center gap-3">
            <Link to="/" className="nav-link text-white">ยื่นคำขอทุน (นักศึกษา)</Link>
            {token ? (
              <>
                <Link to="/admin" className="nav-link text-warning font-semibold">หน้าจัดการเจ้าหน้าที่</Link>
                <button onClick={handleLogout} className="btn btn-outline-light btn-sm">ออกจากระบบ</button>
              </>
            ) : (
              <Link to="/login" className="btn btn-light btn-sm fw-semibold">เข้าสู่ระบบเจ้าหน้าที่</Link>
            )}
          </div>
        </div>
      </nav>

      <main className="container my-4">
        <Routes>
          <Route path="/" element={<PublicView />} />
          <Route path="/login" element={<LoginView onLoginSuccess={handleLogin} />} />
          <Route path="/admin" element={token ? <AdminView /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

// ----------------------------------------------------
// 1. หน้าสาธารณะสำหรับนักศึกษา (บันทึกลง Database จริง)
// ----------------------------------------------------
function PublicView() {
  const [types, setTypes] = useState([]);

  useEffect(() => {
    axios.get('/api/scholarship-types')
      .then(res => setTypes(res.data))
      .catch(err => console.error('Error fetching types:', err));
  }, []);

  const handleStudentSubmit = async (formData) => {
    try {
      await axios.post('/api/requests', formData);
      alert('🎉 ยื่นคำขอทุนการศึกษาสำเร็จเรียบร้อยแล้ว!');
    } catch (err) {
      alert(err.response?.data?.error || 'เกิดข้อผิดพลาดในการยื่นคำขอ');
    }
  };

  return <StudentForm scholarshipTypes={types} onSubmitSuccess={handleStudentSubmit} />;
}

// ----------------------------------------------------
// 2. หน้าเข้าสู่ระบบ (ตรวจสอบกับ Database จริง)
// ----------------------------------------------------
function LoginView({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/auth/login', { username, password });
      onLoginSuccess(res.data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="row justify-content-center my-5">
      <div className="col-md-5">
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h4 className="card-title text-center text-primary fw-bold mb-4">เข้าสู่ระบบเจ้าหน้าที่</h4>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-3">
                <label className="form-label font-semibold">Username</label>
                <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="form-control" placeholder="admin" />
              </div>
              <div className="mb-3">
                <label className="form-label font-semibold">Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="form-control" placeholder="admin1234" />
              </div>
              <button type="submit" className="btn btn-primary w-100 fw-bold">เข้าสู่ระบบ</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 3. หน้าจัดการของเจ้าหน้าที่ (ดึง/แก้/ลบ จาก Database จริง)
// ----------------------------------------------------
function AdminView() {
  const [activeTab, setActiveTab] = useState('list');
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [types, setTypes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ดึงประเภททุน
  const fetchTypes = async () => {
    try {
      const res = await axios.get('/api/scholarship-types');
      setTypes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ดึงข้อมูลสถิติแดชบอร์ด
  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/requests/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ดึงรายการคำขอทุนจาก PostgreSQL จริง
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

  // เปลี่ยนสถานะคำขอ
  const handleStatusChange = async (id, newStatus, remark) => {
    try {
      await axios.patch(`/api/requests/${id}/status`, { status: newStatus, remark });
      alert('🎉 บันทึกการเปลี่ยนสถานะคำขอทุนเรียบร้อยแล้ว!');
      fetchRequests();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.error || 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
    }
  };

  // บันทึกการเพิ่ม/แก้ไขคำขอ
  const handleSaveRequest = async (formData) => {
    try {
      if (formData.id) {
        await axios.put(`/api/requests/${formData.id}`, formData);
        alert('🎉 แก้ไขข้อมูลคำขอทุนสำเร็จเรียบร้อยแล้ว!');
      } else {
        await axios.post('/api/requests', formData);
        alert('🎉 เพิ่มคำขอทุนใหม่สำเร็จเรียบร้อยแล้ว!');
      }
      setIsModalOpen(false);
      setSelectedRequest(null);
      fetchRequests();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  // ลบคำขอทุน (Soft Delete)
  const handleSoftDelete = async (id) => {
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
    <div className="space-y-4">
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body d-flex justify-content-between align-items-center">
          <ul className="nav nav-pills">
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
                รายการคำขอทุน
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                แดชบอร์ดสรุปภาพรวม
              </button>
            </li>
          </ul>
          {activeTab === 'list' && (
            <button onClick={() => { setSelectedRequest(null); setIsModalOpen(true); }} className="btn btn-success fw-semibold">
              + เพิ่มคำขอทุนใหม่
            </button>
          )}
        </div>
      </div>

      {activeTab === 'list' ? (
        <>
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <div className="row g-2">
                <div className="col-md-5">
                  <input
                    type="text"
                    placeholder="🔍 ค้นหาชื่อ หรือ รหัสนักศึกษา..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="form-control"
                  />
                </div>
                <div className="col-md-3">
                  <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="form-select">
                    <option value="">-- กรองทุกสถานะ --</option>
                    <option value="PENDING">รอพิจารณา</option>
                    <option value="APPROVED">อนุมัติ</option>
                    <option value="REJECTED">ไม่อนุมัติ</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="form-select">
                    <option value="">-- กรองทุกประเภททุน --</option>
                    {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <AdminTable
            requests={requests}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onEdit={(req) => { setSelectedRequest(req); setIsModalOpen(true); }}
            onDelete={handleSoftDelete}
            onStatusChange={handleStatusChange}
          />
        </>
      ) : (
        <Dashboard stats={stats} />
      )}

      <RequestModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedRequest(null); }}
        onSave={handleSaveRequest}
        onDelete={handleSoftDelete}
        request={selectedRequest}
        scholarshipTypes={types}
      />
    </div>
  );
}