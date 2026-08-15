import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ token, onLogout }) {
  const navigate = useNavigate();
  return (
    <nav className="bg-blue-900 text-white p-4 shadow-md flex justify-between items-center">
      <Link to="/" className="font-bold text-lg">ระบบทุนการศึกษา ม.อ. (PSU Scholarship)</Link>
      <div className="space-x-4 text-sm">
        <Link to="/" className="hover:underline">ยื่นคำขอทุน (นักศึกษา)</Link>
        {token ? (
          <>
            <Link to="/admin" className="hover:underline font-semibold text-yellow-300">หน้าจัดการเจ้าหน้าที่</Link>
            <button onClick={() => { onLogout(); navigate('/'); }} className="bg-red-600 px-3 py-1 rounded text-xs hover:bg-red-700">ออกจากระบบ</button>
          </>
        ) : (
          <Link to="/login" className="bg-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-800">เข้าสู่ระบบเจ้าหน้าที่</Link>
        )}
      </div>
    </nav>
  );
}