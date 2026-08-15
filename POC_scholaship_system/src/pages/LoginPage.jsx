import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { username, password });
      onLoginSuccess(res.data.token);
      navigate('/admin');
    } catch (err) {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 bg-white p-8 rounded shadow">
      <h2 className="text-xl font-bold mb-6 text-center text-blue-900">เข้าสู่ระบบสำหรับเจ้าหน้าที่</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm">Username</label>
          <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border p-2 rounded mt-1" />
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-2 rounded mt-1" />
        </div>
        <button type="submit" className="w-full bg-blue-900 text-white py-2 rounded font-semibold hover:bg-blue-800">เข้าสู่ระบบ</button>
      </form>
    </div>
  );
}