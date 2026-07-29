import React, { useState } from 'react';
import MainLayout from '../Layout/MainLayout';
import { 
    Calendar, 
    RefreshCw, 
    Edit, 
    Eye, 
    X, 
    AlertCircle,
    Trash2
} from 'lucide-react';
import { Head, useForm, Link, router, usePage } from '@inertiajs/react';

export default function Payrolls({ payrolls = [], selectedDate }) {
    const { props } = usePage();
    const userRole = props.auth?.user?.role || 'admin';
    const canDeletePayroll = userRole === 'superadmin' || userRole === 'admin';
    const [date, setDate] = useState(selectedDate);
    const [editPayroll, setEditPayroll] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus data penggajian karyawan ini?')) {
            router.post(`/payrolls/${id}/delete`);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const pageIds = payrolls.map((p) => p.id);
            setSelectedIds([...new Set([...selectedIds, ...pageIds])]);
        } else {
            const pageIds = payrolls.map((p) => p.id);
            setSelectedIds(selectedIds.filter((id) => !pageIds.includes(id)));
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((item) => item !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkDelete = () => {
        if (confirm(`Apakah Anda yakin ingin menghapus secara massal ${selectedIds.length} data gaji terpilih? Tindakan ini tidak dapat dibatalkan.`)) {
            router.post('/payrolls/bulk-delete', { ids: selectedIds }, {
                onSuccess: () => setSelectedIds([]),
            });
        }
    };

    const { data, setData, post, reset } = useForm({
        bonuses: 0,
        deductions: 0,
        status: 'Draft',
    });

    const formatRupiah = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const formatDateLabel = (dateStr) => {
        try {
            return new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
        } catch (e) {
            return dateStr;
        }
    };

    const handleFilterChange = (newDate) => {
        setDate(newDate);
        setSelectedIds([]);
        router.get('/payrolls', { date: newDate }, { preserveState: true });
    };

    const handleRecalculate = () => {
        setIsCalculating(true);
        router.post('/payrolls/generate', { date }, {
            onSuccess: () => {
                setIsCalculating(false);
                setSelectedIds([]);
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

    const totalNetPayout = payrolls.reduce((acc, p) => acc + p.net_salary, 0);
    const totalDeductions = payrolls.reduce((acc, p) => acc + p.deductions, 0);
    const allSelected = payrolls.length > 0 && payrolls.every((p) => selectedIds.includes(p.id));
    const colSpan = canDeletePayroll ? 10 : 9;

    return (
        <MainLayout title="Daftar Penggajian">
            <Head title="Manajemen Penggajian Harian" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                    <h2 className="text-sm font-extrabold text-slate-900 leading-none mb-1">Rekapitulasi Penggajian Harian</h2>
                    <p className="text-[10px] text-slate-500 font-medium">Perhitungan gaji per hari berdasarkan kehadiran & denda keterlambatan</p>
                </div>
                <button
                    onClick={handleRecalculate}
                    disabled={isCalculating}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 active:translate-y-[1px] disabled:opacity-50"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
                    Kalkulasi Gaji Hari Ini
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                <div className="md:col-span-5 bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 shrink-0">
                        <Calendar className="w-4.5 h-4.5 text-teal-600" />
                        <span className="text-xs font-extrabold text-slate-800 uppercase">Tanggal Gaji</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            className="text-xs border border-slate-200 rounded-lg p-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-teal-500/20 bg-white font-bold text-slate-800"
                        />
                        <span className="text-[9px] text-slate-400 font-semibold">{formatDateLabel(date)}</span>
                    </div>
                </div>

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

            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                <div className="overflow-x-auto pb-1">
                    <table className="w-full min-w-[980px] text-left text-xs table-fixed">
                        <thead>
                            <tr className="border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase">
                                {canDeletePayroll && (
                                    <th className="w-[44px] py-2.5 pl-3 pr-2">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={handleSelectAll}
                                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500/20 w-3.5 h-3.5 cursor-pointer"
                                            disabled={payrolls.length === 0}
                                        />
                                    </th>
                                )}
                                <th className="w-[210px] py-2.5 pr-5">Karyawan (NIP)</th>
                                <th className="w-[92px] py-2.5 px-3 text-center">Status Hadir</th>
                                <th className="w-[130px] py-2.5 px-3 text-right">Gaji Harian</th>
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
                                    <td colSpan={colSpan} className="text-center py-10 text-slate-400">
                                        <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                                        <p className="font-bold text-[11px] mb-2">Gaji untuk tanggal ini belum dikalkulasi.</p>
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
                                    <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors ${selectedIds.includes(p.id) ? 'bg-teal-50/20' : ''}`}>
                                        {canDeletePayroll && (
                                            <td className="py-3 pl-3 pr-2 align-middle">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(p.id)}
                                                    onChange={() => handleSelectOne(p.id)}
                                                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500/20 w-3.5 h-3.5 cursor-pointer"
                                                />
                                            </td>
                                        )}
                                        <td className="py-3 pr-5 font-bold text-slate-950 align-middle">
                                            {p.employee.name}
                                            <span className="block text-[9.5px] text-slate-400 font-medium tabular-nums">{p.employee.nip} • {p.employee.role}</span>
                                        </td>
                                        <td className="py-3 px-3 text-center tabular-nums font-bold align-middle whitespace-nowrap">
                                            {p.days_present > 0 ? (
                                                <span className={p.days_late > 0 ? 'text-amber-600' : 'text-teal-600'}>
                                                    {p.days_late > 0 ? 'Terlambat' : 'Hadir'}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">Tidak Hadir</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-3 text-right font-bold tabular-nums text-slate-600 align-middle whitespace-nowrap">{formatRupiah(p.base_salary)}</td>
                                        <td className="py-3 px-3 text-right font-bold tabular-nums text-slate-600 align-middle whitespace-nowrap">{formatRupiah(p.weekly_allowances_total)}</td>
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
                                                    className="p-1 rounded bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 border border-amber-100 transition-colors"
                                                    title="Sesuaikan Gaji"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <Link
                                                    href={`/payrolls/${p.id}/payslip`}
                                                    className="p-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border border-blue-100 transition-colors"
                                                    title="Lihat Slip Gaji"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </Link>
                                                {canDeletePayroll && (
                                                    <button
                                                        onClick={() => handleDelete(p.id)}
                                                        className="p-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 border border-rose-100 transition-colors cursor-pointer"
                                                        title="Hapus Gaji"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
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
            </div>

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
                                <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">Potongan default = denda keterlambatan hari ini (menit × tarif).</p>
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

            {canDeletePayroll && selectedIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-teal-200/60 px-4 py-3 rounded-xl shadow-xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold border border-teal-100">
                            {selectedIds.length}
                        </span>
                        <span className="text-[11px] text-slate-600 font-bold">
                            Data gaji terpilih
                        </span>
                    </div>
                    <div className="h-4 w-px bg-slate-200" />
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSelectedIds([])}
                            className="text-[10px] font-bold text-slate-500 hover:text-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg shadow-sm shadow-rose-500/10 hover:shadow-rose-500/20 transition-all flex items-center gap-1 active:translate-y-[1px] cursor-pointer"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus Massal
                        </button>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
