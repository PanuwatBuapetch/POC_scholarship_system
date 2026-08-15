import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Dashboard({ stats }) {
  if (!stats) return <div className="p-4 text-center">กำลังโหลดข้อมูล...</div>;

  const statusData = {
    labels: ['รอพิจารณา', 'อนุมัติ', 'ไม่อนุมัติ'],
    datasets: [
      {
        label: 'จำนวนคำขอ',
        data: [stats.pendingCount || 0, stats.approvedCount || 0, stats.rejectedCount || 0],
        backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
      },
    ],
  };

  const typeData = {
    labels: stats.byType?.map((t) => t.name) || [],
    datasets: [
      {
        label: 'ยอดเงินรวมที่ขอ (บาท)',
        data: stats.byType?.map((t) => t.totalAmount) || [],
        backgroundColor: '#0d6efd',
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div className="container-fluid py-2">
      {/* 1. Stat Cards (การ์ดสรุปตัวเลข 4 ช่อง) */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 shadow-sm border-start border-primary border-4 p-3">
            <div className="text-secondary small fw-bold">คำขอทั้งหมด</div>
            <div className="fs-2 fw-bold text-dark">{stats.totalCount || 0}</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 shadow-sm border-start border-warning border-4 p-3">
            <div className="text-secondary small fw-bold">รอพิจารณา</div>
            <div className="fs-2 fw-bold text-warning">{stats.pendingCount || 0}</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 shadow-sm border-start border-success border-4 p-3">
            <div className="text-secondary small fw-bold">อนุมัติแล้ว</div>
            <div className="fs-2 fw-bold text-success">{stats.approvedCount || 0}</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="card border-0 shadow-sm border-start border-danger border-4 p-3">
            <div className="text-secondary small fw-bold">ไม่อนุมัติ</div>
            <div className="fs-2 fw-bold text-danger">{stats.rejectedCount || 0}</div>
          </div>
        </div>
      </div>

      {/* 2. Charts (กราฟสรุปภาพรวม 2 ฝั่ง) */}
      <div className="row g-4">
        <div className="col-12 col-md-5">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h6 className="fw-bold mb-3 text-secondary">สัดส่วนสถานะคำขอทุน</h6>
            <div style={{ height: '280px', position: 'relative' }} className="d-flex justify-content-center align-items-center">
              <Pie data={statusData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        <div className="col-12 col-md-7">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h6 className="fw-bold mb-3 text-secondary">ยอดเงินรวมที่ขอแยกตามประเภททุน (บาท)</h6>
            <div style={{ height: '280px', position: 'relative' }}>
              <Bar data={typeData} options={barOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}