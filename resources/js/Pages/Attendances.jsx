import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import MainLayout from '../Layout/MainLayout';
import { 
    Calendar, 
    ChevronLeft, 
    ChevronRight, 
    UserCheck, 
    AlertCircle, 
    Edit, 
    X,
    Filter,
    Plus
} from 'lucide-react';

export default function Attendances({ records = [], selectedMonth, selectedYear }) {
    const [month, setMonth] = useState(selectedMonth);
    const [year, setYear] = useState(selectedYear);
    const [showCorrectionForm, setShowCorrectionForm] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [selectedAttendanceId, setSelectedAttendanceId] = useState(null);

    const { data, setData, post, reset, errors } = useForm({
        employee_id: '',
        date: '',
        clock_in: '',
        clock_out: '',
        status: 'Present',
        notes: '',
    });

    const monthsList = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    // Get number of days in selected month/year
    const getDaysInMonth = (m, y) => {
        return new Date(y, m, 0).getDate();
    };

    const daysCount = getDaysInMonth(month, year);
    const daysArray = Array.from({ length: daysCount }, (_, i) => i + 1);

    const handleMonthChange = (newMonth) => {
        setMonth(newMonth);
        router.get('/attendances', { month: newMonth, year }, { preserveState: true });
    };

    const handleYearChange = (newYear) => {
        setYear(newYear);
        router.get('/attendances', { month, year: newYear }, { preserveState: true });
    };

    const formatMinutesDuration = (minutes) => {
        const totalMinutes = Number(minutes) || 0;

        if (totalMinutes < 60) {
            return `${totalMinutes} menit`;
        }

        const hours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;

        return remainingMinutes > 0
            ? `${hours} jam ${remainingMinutes} menit`
            : `${hours} jam`;
    };

    const handleOpenCorrection = (employeeId, dayNum) => {
        // Find if there is an existing record for this day
        const empRecord = records.find(r => r.employee_id === employeeId);
        const dayRecord = empRecord?.days[dayNum];
        
        const pad = (n) => n.toString().padStart(2, '0');
        const dateString = `${year}-${pad(month)}-${pad(dayNum)}`;

        setData({
            employee_id: employeeId,
            date: dateString,
            clock_in: dayRecord?.clock_in || '',
            clock_out: dayRecord?.clock_out || '',
            status: dayRecord?.status || 'Present',
            notes: '',
        });
        
        setSelectedRecord({
            name: empRecord.name,
            nip: empRecord.nip,
            day: dayNum
        });
        setSelectedAttendanceId(dayRecord?.id || null);
        setShowCorrectionForm(true);
    };

    const handleNewManualClick = () => {
        reset();
        const todayStr = new Date().toISOString().split('T')[0];
        setData({
            employee_id: records[0]?.employee_id || '',
            date: todayStr,
            clock_in: '',
            clock_out: '',
            status: 'Present',
            notes: '',
        });
        setSelectedRecord(null);
        setSelectedAttendanceId(null);
        setShowCorrectionForm(true);
    };

    const handleCorrectionSubmit = (e) => {
        e.preventDefault();
        post('/attendances/manual', {
            onSuccess: () => {
                setShowCorrectionForm(false);
                setSelectedAttendanceId(null);
                reset();
            }
        });
    };

    const handleDeleteAttendance = () => {
        if (confirm('Apakah Anda yakin ingin menghapus data presensi ini?')) {
            router.post(`/attendances/${selectedAttendanceId}/delete`, {}, {
                onSuccess: () => {
                    setShowCorrectionForm(false);
                    setSelectedAttendanceId(null);
                    reset();
                }
            });
        }
    };

    return (
        <MainLayout title="Rekap Presensi">
            <Head title="Rekap Presensi Bulanan" />

            {/* Header section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                    <h2 className="text-sm font-extrabold text-slate-900 leading-none mb-1">Presensi Bulanan</h2>
                    <p className="text-[10px] text-slate-500 font-medium">Rekapitulasi scan kehadiran staff SPPG Sukajadi</p>
                </div>
                <button
                    onClick={handleNewManualClick}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1 active:translate-y-[1px]"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Input Manual
                </button>
            </div>

            {/* Selector bar */}
            <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    <span className="text-xs font-extrabold text-slate-900 uppercase">Periode Presensi:</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleMonthChange(month === 1 ? 12 : month - 1)}
                        className="p-1 rounded hover:bg-slate-50 border border-slate-200"
                    >
                        <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                    
                    <select
                        value={month}
                        onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                        className="text-xs font-bold border border-slate-200 rounded-lg p-1 px-2 focus:outline-none focus:ring-1 focus:ring-teal-500/20 bg-white text-slate-800"
                    >
                        {monthsList.map((mName, index) => (
                            <option key={index + 1} value={index + 1}>{mName}</option>
                        ))}
                    </select>

                    <select
                        value={year}
                        onChange={(e) => handleYearChange(parseInt(e.target.value))}
                        className="text-xs font-bold border border-slate-200 rounded-lg p-1 px-2 focus:outline-none focus:ring-1 focus:ring-teal-500/20 bg-white text-slate-800"
                    >
                        {Array.from({ length: 5 }, (_, i) => year - 2 + i).map((yNum) => (
                            <option key={yNum} value={yNum}>{yNum}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => handleMonthChange(month === 12 ? 1 : month + 1)}
                        className="p-1 rounded hover:bg-slate-50 border border-slate-200"
                    >
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                </div>
            </div>

            {/* Matrix Sheet Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* Attendance Matrix Table */}
                <div className={`bg-white border border-slate-100 rounded-xl p-4 shadow-sm overflow-hidden ${showCorrectionForm ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
                    
                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-3.5 mb-3 border-b border-slate-50 pb-2 text-[10px] font-bold text-slate-500">
                        <span className="text-slate-700">Keterangan:</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-green-500 inline-block" /> H = Masuk Tepat Waktu</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" /> T = Terlambat Scan</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" /> A = Mangkir / Alpa</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block" /> I = Izin / Sakit</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-teal-700 underline">Klik sel tanggal untuk koreksi data</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-center border-collapse text-[10px]">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-500 font-extrabold uppercase">
                                    <th className="py-2 pr-4 text-left min-w-[150px] sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Nama Karyawan</th>
                                    {daysArray.map((d) => (
                                        <th key={d} className="py-2 px-1 min-w-[20px] font-bold select-none">{d}</th>
                                    ))}
                                    <th className="py-2 px-2 font-bold text-green-700 min-w-[24px]">H</th>
                                    <th className="py-2 px-2 font-bold text-amber-700 min-w-[24px]">T</th>
                                    <th className="py-2 px-2 font-bold text-rose-700 min-w-[24px]">A</th>
                                    <th className="py-2 px-2 font-bold text-blue-700 min-w-[24px]">I</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                                {records.length === 0 ? (
                                    <tr>
                                        <td colSpan={daysCount + 5} className="text-center py-6 text-slate-400 font-bold">
                                            Tidak ada data karyawan aktif.
                                        </td>
                                    </tr>
                                ) : (
                                    records.map((rec) => (
                                        <tr key={rec.employee_id} className="hover:bg-slate-50/50 transition-colors">
                                            {/* Name sticky column */}
                                            <td className="py-2.5 pr-4 text-left font-bold text-slate-900 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] flex flex-col">
                                                <span className="truncate max-w-[140px]">{rec.name}</span>
                                                <span className="text-[8px] text-slate-400 font-medium tracking-wide leading-none mt-0.5">{rec.role}</span>
                                            </td>

                                            {/* Days cells */}
                                            {daysArray.map((d) => {
                                                const dayRecord = rec.days[d];
                                                let cellClass = "text-slate-300 bg-slate-50/30 hover:bg-slate-100 cursor-pointer";
                                                let text = "-";

                                                if (dayRecord) {
                                                    if (dayRecord.status === 'Present') {
                                                        cellClass = "bg-green-500 text-white font-bold cursor-pointer rounded hover:scale-110 transition-transform";
                                                        text = "H";
                                                    } else if (dayRecord.status === 'Late') {
                                                        cellClass = "bg-amber-500 text-white font-bold cursor-pointer rounded hover:scale-110 transition-transform";
                                                        text = "T";
                                                    } else if (dayRecord.status === 'Absent') {
                                                        cellClass = "bg-rose-500 text-white font-bold cursor-pointer rounded hover:scale-110 transition-transform";
                                                        text = "A";
                                                    } else if (dayRecord.status === 'Leave') {
                                                        cellClass = "bg-blue-500 text-white font-bold cursor-pointer rounded hover:scale-110 transition-transform";
                                                        text = "I";
                                                    }
                                                }

                                                return (
                                                    <td 
                                                        key={d} 
                                                        onClick={() => handleOpenCorrection(rec.employee_id, d)}
                                                        className={`p-1 border border-slate-100 ${cellClass}`}
                                                        title={dayRecord ? `${rec.name} (${d}/${month}): ${dayRecord.status}${dayRecord.status === 'Late' ? ` (${formatMinutesDuration(dayRecord.late_minutes)})` : ''} ${dayRecord.clock_in ? `[${dayRecord.clock_in} - ${dayRecord.clock_out || '?'}]` : ''}` : `Klik untuk input presensi tgl ${d}`}
                                                    >
                                                        {text}
                                                    </td>
                                                );
                                            })}

                                            {/* Summaries */}
                                            <td className="py-2.5 px-2 text-green-600 font-bold bg-green-50/20">{rec.summary.present}</td>
                                            <td className="py-2.5 px-2 text-amber-600 font-bold bg-amber-50/20">{rec.summary.late}</td>
                                            <td className="py-2.5 px-2 text-rose-600 font-bold bg-rose-50/20">{rec.summary.absent}</td>
                                            <td className="py-2.5 px-2 text-blue-600 font-bold bg-blue-50/20">{rec.summary.leave}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Correction Form Panel */}
                {showCorrectionForm && (
                    <div className="lg:col-span-4 bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-4 animate-in slide-in-from-right-4 duration-200">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                                {selectedRecord ? 'Koreksi Presensi' : 'Input Presensi Baru'}
                            </h3>
                            <button
                                onClick={() => setShowCorrectionForm(false)}
                                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-50"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {selectedRecord && (
                            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs leading-normal">
                                <p className="font-bold text-slate-800">{selectedRecord.name}</p>
                                <p className="text-[10px] text-slate-500 font-bold">NIP: {selectedRecord.nip} • Tanggal {selectedRecord.day} {monthsList[month-1]} {year}</p>
                            </div>
                        )}

                        <form onSubmit={handleCorrectionSubmit} className="space-y-3">
                            {!selectedRecord && (
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Pilih Karyawan</label>
                                    <select
                                        value={data.employee_id}
                                        onChange={(e) => setData('employee_id', e.target.value)}
                                        className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none"
                                        required
                                    >
                                        {records.map(r => (
                                            <option key={r.employee_id} value={r.employee_id}>{r.name} ({r.role})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {!selectedRecord && (
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Tanggal</label>
                                    <input
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                        className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none"
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-1">Status Kehadiran</label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none"
                                >
                                    <option value="Present">Present (Hadir Tepat Waktu)</option>
                                    <option value="Late">Late (Terlambat Scan)</option>
                                    <option value="Absent">Absent (Alpa/Mangkir)</option>
                                    <option value="Leave">Leave (Izin Resmi / Sakit)</option>
                                </select>
                            </div>

                            {/* Clock Times fields (Only show if present/late) */}
                            {(data.status === 'Present' || data.status === 'Late') && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Jam Masuk</label>
                                        <input
                                            type="time"
                                            value={data.clock_in}
                                            onChange={(e) => setData('clock_in', e.target.value)}
                                            className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none"
                                            placeholder="06:00"
                                            required={data.status === 'Late'}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Jam Pulang</label>
                                        <input
                                            type="time"
                                            value={data.clock_out}
                                            onChange={(e) => setData('clock_out', e.target.value)}
                                            className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none"
                                            placeholder="15:00"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-1">Catatan Koreksi (Opsional)</label>
                                <textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows="2"
                                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none"
                                    placeholder="Contoh: Lupa bawa kartu, Izin sakit dengan surat, dll."
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-grow bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2 px-4 rounded-lg shadow transition-all flex items-center justify-center gap-1 active:translate-y-[1px]"
                                >
                                    Simpan Rekor
                                </button>
                                {selectedAttendanceId && (
                                    <button
                                        type="button"
                                        onClick={handleDeleteAttendance}
                                        className="bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold py-2 px-3 rounded-lg border border-rose-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                        Hapus
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
