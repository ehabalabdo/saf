import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import { HrAttendanceRecord, HrEmployee } from '../types';
import { hrAttendanceService, hrEmployeesService } from '../services/hrApiServices';
import { useLanguage } from '../context/LanguageContext';

const STATUS_COLORS: Record<string, string> = {
  normal: 'bg-emerald-100 text-emerald-700',
  late: 'bg-amber-100 text-amber-700',
  incomplete: 'bg-blue-100 text-blue-700',
  absent: 'bg-red-100 text-red-600',
  weekend: 'bg-slate-100 text-slate-500',
};

const STATUS_LABELS_AR: Record<string, string> = {
  normal: 'منتظم',
  late: 'متأخر',
  incomplete: 'غير مكتمل',
  absent: 'غائب',
  weekend: 'عطلة',
};

function fmtTime(ts: string | null) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtMinutes(mins: number) {
  if (!mins) return '—';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function downloadCSV(rows: HrAttendanceRecord[]) {
  const header = 'Date,Employee,Check In,Check Out,Total Min,Late Min,Overtime Min,Status\n';
  const body = rows.map(r =>
    `${r.workDate},"${r.employeeName || ''}",${r.checkIn ? new Date(r.checkIn).toISOString() : ''},${r.checkOut ? new Date(r.checkOut).toISOString() : ''},${r.totalMinutes},${r.lateMinutes},${r.overtimeMinutes},${r.status}`
  ).join('\n');
  const blob = new Blob([header + body], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `attendance_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const HrAttendanceView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [records, setRecords] = useState<HrAttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<HrEmployee[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const [fromDate, setFromDate] = useState(weekAgo);
  const [toDate, setToDate] = useState(today);
  const [filterEmployee, setFilterEmployee] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [recs, emps] = await Promise.all([
        hrAttendanceService.getAll({
          from: fromDate,
          to: toDate,
          employee_id: filterEmployee ? parseInt(filterEmployee) : undefined,
          status: filterStatus || undefined,
        }),
        hrEmployeesService.getAll(),
      ]);
      setRecords(recs);
      setEmployees(emps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, filterEmployee, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Stats
  const totalRecords = records.length;
  const lateCount = records.filter(r => r.status === 'late').length;
  const incompleteCount = records.filter(r => r.status === 'incomplete').length;
  const avgMinutes = totalRecords > 0 ? Math.round(records.reduce((s, r) => s + (r.totalMinutes || 0), 0) / totalRecords) : 0;

  return (
    <Layout title={isAr ? 'سجل الحضور - HR' : 'HR Attendance'}>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl shadow-soft border border-gray-100 text-center">
          <div className="text-2xl font-extrabold text-slate-800">{totalRecords}</div>
          <div className="text-xs font-bold uppercase text-slate-400">{isAr ? 'سجلات' : 'Records'}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-soft border border-gray-100 text-center">
          <div className="text-2xl font-extrabold text-amber-600">{lateCount}</div>
          <div className="text-xs font-bold uppercase text-slate-400">{isAr ? 'متأخر' : 'Late'}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-soft border border-gray-100 text-center">
          <div className="text-2xl font-extrabold text-blue-600">{incompleteCount}</div>
          <div className="text-xs font-bold uppercase text-slate-400">{isAr ? 'غير مكتمل' : 'Incomplete'}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-soft border border-gray-100 text-center">
          <div className="text-2xl font-extrabold text-slate-800">{fmtMinutes(avgMinutes)}</div>
          <div className="text-xs font-bold uppercase text-slate-400">{isAr ? 'متوسط العمل' : 'Avg Work'}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{isAr ? 'من' : 'From'}</label>
            <input type="date" className="p-2.5 rounded-xl border border-gray-200 outline-none text-sm" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{isAr ? 'إلى' : 'To'}</label>
            <input type="date" className="p-2.5 rounded-xl border border-gray-200 outline-none text-sm" value={toDate} onChange={e => setToDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{isAr ? 'الموظف' : 'Employee'}</label>
            <select className="p-2.5 rounded-xl border border-gray-200 outline-none text-sm min-w-[150px]" value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)}>
              <option value="">{isAr ? 'الكل' : 'All'}</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.fullName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{isAr ? 'الحالة' : 'Status'}</label>
            <select className="p-2.5 rounded-xl border border-gray-200 outline-none text-sm min-w-[120px]" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">{isAr ? 'الكل' : 'All'}</option>
              <option value="normal">{isAr ? 'منتظم' : 'Normal'}</option>
              <option value="late">{isAr ? 'متأخر' : 'Late'}</option>
              <option value="incomplete">{isAr ? 'غير مكتمل' : 'Incomplete'}</option>
              <option value="weekend">{isAr ? 'عطلة' : 'Weekend'}</option>
            </select>
          </div>
          <button onClick={() => downloadCSV(records)} className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center gap-2 ms-auto">
            <i className="fa-solid fa-download"></i> CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400"><i className="fa-solid fa-circle-notch fa-spin text-2xl"></i></div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <i className="fa-solid fa-calendar-xmark text-4xl mb-3 block"></i>
            <p className="font-bold">{isAr ? 'لا توجد سجلات' : 'No records found'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-start">{isAr ? 'التاريخ' : 'Date'}</th>
                  <th className="px-4 py-3 text-start">{isAr ? 'الموظف' : 'Employee'}</th>
                  <th className="px-4 py-3 text-center">{isAr ? 'دخول' : 'In'}</th>
                  <th className="px-4 py-3 text-center">{isAr ? 'خروج' : 'Out'}</th>
                  <th className="px-4 py-3 text-center">{isAr ? 'المجموع' : 'Total'}</th>
                  <th className="px-4 py-3 text-center">{isAr ? 'تأخير' : 'Late'}</th>
                  <th className="px-4 py-3 text-center">{isAr ? 'إضافي' : 'OT'}</th>
                  <th className="px-4 py-3 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-slate-700 font-medium">{fmtDate(r.workDate)}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{r.employeeName}</td>
                    <td className="px-4 py-3 text-center font-mono text-xs">{fmtTime(r.checkIn)}</td>
                    <td className="px-4 py-3 text-center font-mono text-xs">{fmtTime(r.checkOut)}</td>
                    <td className="px-4 py-3 text-center font-bold">{fmtMinutes(r.totalMinutes)}</td>
                    <td className="px-4 py-3 text-center">
                      {r.lateMinutes > 0 ? <span className="text-amber-600 font-bold">{r.lateMinutes}m</span> : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.overtimeMinutes > 0 ? <span className="text-indigo-600 font-bold">{r.overtimeMinutes}m</span> : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[r.status] || 'bg-slate-100 text-slate-500'}`}>
                        {isAr ? (STATUS_LABELS_AR[r.status] || r.status) : r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HrAttendanceView;
