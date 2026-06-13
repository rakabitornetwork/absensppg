import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import MainLayout from '../Layout/MainLayout';
import { 
    Banknote, 
    Calendar, 
    RefreshCw, 
    Edit, 
    Eye, 
    Printer, 
    X, 
    CheckCircle, 
    AlertCircle 
} from 'lucide-react';

export default function Payrolls({ payrolls = [], selectedMonth, selectedYear }) {
    const [month, setMonth] = useState(selectedMonth);
    const [year, setYear] = useState(selectedYear);
    const [editPayroll, setEditPayroll] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);

    const { data, setData, post, reset, errors } = useForm({
        bonuses: 0,
        deductions: 0,
        status: 'Draft',
    });

    const monthsList = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const formatRupiah = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const handleFilterChange = (newMonth, newYear) => {
        setMonth(newMonth);
        setYear(newYear);
        router.get('/payrolls', { month: newMonth, year: newYear }, { preserveState: true });
    };

    const handleRecalculate = () => {
        setIsCalculating(true);
        router.post('/payrolls/generate', { month, year }, {
            onSuccess: () => {
                setIsCalculating(false);
            },
            onError: () => {
                setIsCalculating(false);
            }
        });
    };

    const handleEditClick = (p) => {
        setEditPayroll(p);
        setData({
            bonuses: p.bonuses,
            deductions: p.deductions,
            status: p.status,
        });
    };

    const handleUpdateSubmit = (e) => {
        e.preventDefault();
        post(`/payrolls/${editPayroll.id}/update`, {
            onSuccess: () => {
                setEditPayroll(null);
                reset();
            }
        });
    };

    // Calculate total net payroll for the page summary
    const totalNetPayout = payrolls.reduce((acc, p) => acc + p.net_salary, 0);
    const totalDeductions = payrolls.reduce((acc, p) => acc + p.deductions, 0);

    return (
        <MainLayout title="Daftar Penggajian">
            <Head title="Manajemen Penggajian / Payroll" />

            {/* Title / Action bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                    <h2 className="text-sm font-extrabold text-slate-900 leading-none mb-1">Rekapitulasi Penggajian</h2>
                    <p className="text-[10px] text-slate-500 font-medium">Perhitungan gaji berdasarkan tingkat kehadiran & denda absensi SPPG</p>
                </div>
                <button
                    onClick={handleRecalculate}
                    disabled={isCalculating}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 active:translate-y-[1px] disabled:opacity-50"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
                    Kalkulasi Ulang Gaji
                </button>
            </div>

            {/* Month & Stats Dashboard Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                {/* Period Selector Card (5 columns) */}
                <div className="md:col-span-5 bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4.5 h-4.5 text-teal-600" />
                        <span className="text-xs font-extrabold text-slate-800 uppercase">Periode Gaji</span>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={month}
                            onChange={(e) => handleFilterChange(parseInt(e.target.value), year)}
                            className="text-xs border border-slate-200 rounded-lg p-1 px-2 focus:outline-none focus:ring-1 focus:ring-teal-500/20 bg-white font-bold text-slate-800"
                        >
                            {monthsList.map((mName, index) => (
                                <option key={index + 1} value={index + 1}>{mName}</option>
                            ))}
                        </select>
                        <select
                            value={year}
                            onChange={(e) => handleFilterChange(month, parseInt(e.target.value))}
                            className="text-xs border border-slate-200 rounded-lg p-1 px-2 focus:outline-none focus:ring-1 focus:ring-teal-500/20 bg-white font-bold text-slate-800"
                        >
                            {Array.from({ length: 5 }, (_, i) => year - 2 + i).map((yNum) => (
                                <option key={yNum} value={yNum}>{yNum}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Total Stats summary Card (7 columns) */}
                <div className="md:col-span-7 bg-white border border-slate-100 rounded-xl p-3 shadow-sm grid grid-cols-2 gap-4 divide-x divide-slate-100">
                    <div className="flex flex-col justify-center px-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Total Pembayaran Bersih</span>
                        <h3 className="text-sm font-extrabold text-teal-700 leading-tight mt-1">{formatRupiah(totalNetPayout)}</h3>
                    </div>
                    <div className="flex flex-col justify-center px-4">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Total Potongan Keterlambatan</span>
                        <h3 className="text-sm font-extrabold text-rose-700 leading-tight mt-1">{formatRupiah(totalDeductions)}</h3>
                    </div>
                </div>
            </div>

            {/* Payroll Data Table */}
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                <div className="overflow-x-auto pb-1">
                    <table className="w-full min-w-[980px] text-left text-xs table-fixed">
                        <thead>
                            <tr className="border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase">
                                <th className="w-[210px] py-2.5 pr-5">Karyawan (NIP)</th>
                                <th className="w-[92px] py-2.5 px-3 text-center">Kehadiran</th>
                                <th className="w-[130px] py-2.5 px-3 text-right">Gaji Pokok</th>
                                <th className="w-[130px] py-2.5 px-3 text-right">Tunj. Harian</th>
                                <th className="w-[110px] py-2.5 px-3 text-right text-teal-700">Bonus</th>
                                <th className="w-[130px] py-2.5 px-3 text-right text-rose-700">Potongan</th>
                                <th className="w-[145px] py-2.5 px-3 text-right">Gaji Bersih</th>
                                <th className="w-[100px] py-2.5 px-3 text-center">Status</th>
                                <th className="w-[78px] py-2.5 pl-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                            {payrolls.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-10 text-slate-400">
                                        <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                                        <p className="font-bold text-[11px] mb-2">Gaji untuk periode ini belum dikalkulasi.</p>
                                        <button
                                            onClick={handleRecalculate}
                                            className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg active:translate-y-[1px]"
                                        >
                                            Kalkulasi Sekarang
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                payrolls.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 pr-5 font-bold text-slate-950 align-middle">
                                            {p.employee.name}
                                            <span className="block text-[9.5px] text-slate-400 font-medium tabular-nums">{p.employee.nip} • {p.employee.role}</span>
                                        </td>
                                        <td className="py-3 px-3 text-center tabular-nums font-bold align-middle whitespace-nowrap">
                                            <span className="text-slate-800" title="Hari Hadir">{p.days_present}H</span>
                                            {p.days_late > 0 && (
                                                <span className="text-amber-600 ml-1.5" title="Hari Terlambat">({p.days_late}T)</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-3 text-right font-bold tabular-nums text-slate-600 align-middle whitespace-nowrap">{formatRupiah(p.base_salary)}</td>
                                        <td className="py-3 px-3 text-right font-bold tabular-nums text-slate-600 align-middle whitespace-nowrap">{formatRupiah(p.daily_allowances_total)}</td>
                                        <td className="py-3 px-3 text-right font-bold tabular-nums text-teal-600 align-middle whitespace-nowrap">+{formatRupiah(p.bonuses)}</td>
                                        <td className="py-3 px-3 text-right font-bold tabular-nums text-rose-600 align-middle whitespace-nowrap">-{formatRupiah(p.deductions)}</td>
                                        <td className="py-3 px-3 text-right font-extrabold tabular-nums text-slate-950 bg-slate-50/30 align-middle whitespace-nowrap">{formatRupiah(p.net_salary)}</td>
                                        <td className="py-3 px-3 text-center align-middle">
                                            <span className={`inline-block text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                                                p.status === 'Paid'
                                                    ? 'bg-teal-50 text-teal-700 border border-teal-100'
                                                    : p.status === 'Approved'
                                                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                                    : 'bg-slate-50 text-slate-500 border border-slate-200'
                                            }`}>
                                                {p.status === 'Paid' && 'Dibayar'}
                                                {p.status === 'Approved' && 'Disetujui'}
                                                {p.status === 'Draft' && 'Draft'}
                                            </span>
                                        </td>
                                        <td className="py-3 pl-3 text-right align-middle">
                                            <div className="flex justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleEditClick(p)}
                                                    className="p-1 rounded bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-100 transition-colors"
                                                    title="Sesuaikan Gaji"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <Link
                                                    href={`/payrolls/${p.id}/payslip`}
                                                    className="p-1 rounded bg-slate-50 text-slate-500 hover:text-teal-600 hover:bg-teal-50 border border-slate-100 transition-colors"
                                                    title="Lihat Slip Gaji"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Adjustments Form Modal */}
            {editPayroll && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-100 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-900 uppercase">Edit Rincian Gaji</span>
                            <button
                                onClick={() => setEditPayroll(null)}
                                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-50"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateSubmit} className="p-4 space-y-4">
                            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                                <p className="font-bold text-slate-800">{editPayroll.employee.name}</p>
                                <p className="text-[10px] text-slate-500 font-bold">NIP: {editPayroll.employee.nip} • {editPayroll.employee.role}</p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-1">Bonus Tambahan (Rp)</label>
                                <input
                                    type="number"
                                    value={data.bonuses}
                                    onChange={(e) => setData('bonuses', parseInt(e.target.value) || 0)}
                                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 tabular-nums"
                                    min="0"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-1">Total Potongan (Rp)</label>
                                <input
                                    type="number"
                                    value={data.deductions}
                                    onChange={(e) => setData('deductions', parseInt(e.target.value) || 0)}
                                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 tabular-nums"
                                    min="0"
                                    required
                                />
                                <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">Potongan default dihitung otomatis berdasarkan alpa & denda keterlambatan.</p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-1">Status Pembayaran</label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none"
                                >
                                    <option value="Draft">Draft (Belum Diproses)</option>
                                    <option value="Approved">Approved (Disetujui)</option>
                                    <option value="Paid">Paid (Sudah Ditransfer / Bayar)</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2 rounded-lg shadow active:translate-y-[1px] transition-all flex items-center justify-center gap-1 mt-1"
                            >
                                Perbarui & Simpan
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
