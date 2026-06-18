import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '../Layout/MainLayout';
import { 
    Users, 
    UserCheck, 
    Clock, 
    AlertTriangle, 
    DollarSign, 
    CookingPot, 
    ArrowRight, 
    UserX, 
    TrendingUp,
    ShieldCheck,
    MapPin
} from 'lucide-react';

export default function Dashboard({ stats, recentScans, settings, distributionHistory = [] }) {
    const attendanceRate = Math.max(0, Math.min(100, Number(stats.attendance_rate) || 0));
    const attendanceCircleRadius = 15;
    const attendanceCircleCircumference = 2 * Math.PI * attendanceCircleRadius;
    const attendanceCircleOffset = attendanceCircleCircumference * (1 - attendanceRate / 100);
    
    // Distribution target calculations (only counts when status is 'Delivered')
    const distributionPoints = settings.distribution_points 
        ? JSON.parse(settings.distribution_points) 
        : [];
    const totalAllocated = distributionPoints
        .filter(item => item.status === 'Delivered')
        .reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0);
    const mealTarget = parseInt(settings.meal_target) || 250;
    const allocationPercentage = Math.min(100, Math.round((totalAllocated / mealTarget) * 100)) || 0;
    
    const chartRadius = 35;
    const chartCircumference = 2 * Math.PI * chartRadius;
    const chartStrokeDashoffset = chartCircumference * (1 - allocationPercentage / 100);
    
    const formatRupiah = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
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

    return (
        <MainLayout title="Dashboard">
            <Head title="Dashboard" />

            {/* Dashboard Summary Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
                <div>
                    <h2 className="text-sm font-extrabold text-slate-900 leading-none mb-1">Ringkasan Hari Ini</h2>
                    <p className="text-[10px] text-slate-500 font-medium">Laporan status operasional SPPG untuk tanggal {stats.date}</p>
                </div>
                <div className="self-start sm:self-auto text-[10px] bg-blue-50 text-blue-800 border border-blue-100 rounded-md px-2 py-0.5 font-bold flex items-center gap-1 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    Sistem Informasi {settings.office_name || 'SPPG'}
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
                
                {/* Attendance Rate */}
                <div className="bg-gradient-to-br from-lime-600 via-green-600 to-emerald-700 text-white rounded-xl p-3.5 shadow-md shadow-green-600/10 hover:shadow-lg hover:shadow-green-600/20 transition-all flex flex-col justify-between min-h-[105px]">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-lime-100/90 uppercase tracking-wider">Persentase Kehadiran</span>
                        <div className="p-1 rounded-lg bg-white/20 text-white">
                            <TrendingUp className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <h3 className="text-xl font-extrabold text-white leading-none mb-1">{stats.attendance_rate}%</h3>
                            <p className="text-[9px] text-lime-50/80 font-semibold">{stats.present} dari {stats.total_employees} karyawan masuk</p>
                        </div>
                        <div className="w-9 h-9 relative flex items-center justify-center shrink-0">
                            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
                                <circle
                                    cx="18"
                                    cy="18"
                                    r={attendanceCircleRadius}
                                    fill="none"
                                    stroke="rgba(255,255,255,0.22)"
                                    strokeWidth="2.5"
                                />
                                <circle
                                    cx="18"
                                    cy="18"
                                    r={attendanceCircleRadius}
                                    fill="none"
                                    stroke="rgba(255,255,255,0.95)"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeDasharray={attendanceCircleCircumference}
                                    strokeDashoffset={attendanceCircleOffset}
                                />
                            </svg>
                            <span className="text-[9px] font-bold text-white">{stats.present}/{stats.total_employees}</span>
                        </div>
                    </div>
                </div>

                {/* Today's Staff Breakdown */}
                <div className="bg-gradient-to-br from-blue-800 via-blue-700 to-sky-600 text-white rounded-xl p-3.5 shadow-md shadow-blue-700/10 hover:shadow-lg hover:shadow-blue-700/20 transition-all flex flex-col justify-between min-h-[105px]">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-blue-100/90 uppercase tracking-wider">Kehadiran Hari Ini</span>
                        <div className="p-1 rounded-lg bg-white/20 text-white shrink-0">
                            <Users className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                        <div className="flex flex-col justify-end">
                            <span className="text-[8px] font-bold text-emerald-300 uppercase tracking-wide">Tepat Waktu</span>
                            <div className="flex items-baseline gap-0.5 mt-0.5">
                                <span className="text-base font-black text-white leading-none">{stats.present - stats.late}</span>
                                <span className="text-[8px] text-emerald-100/80 font-semibold">staf</span>
                            </div>
                        </div>
                        <div className="flex flex-col justify-end border-l border-white/10 pl-2.5">
                            <span className="text-[8px] font-bold text-amber-300 uppercase tracking-wide">Terlambat</span>
                            <div className="flex items-baseline gap-0.5 mt-0.5">
                                <span className="text-base font-black text-white leading-none">{stats.late}</span>
                                <span className="text-[8px] text-amber-100/80 font-semibold">staf</span>
                            </div>
                        </div>
                        <div className="flex flex-col justify-end border-l border-white/10 pl-2.5">
                            <span className="text-[8px] font-bold text-rose-300 uppercase tracking-wide">Mangkir</span>
                            <div className="flex items-baseline gap-0.5 mt-0.5">
                                <span className="text-base font-black text-white leading-none">{stats.absent}</span>
                                <span className="text-[8px] text-rose-100/80 font-semibold">staf</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Meal Prep Status */}
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl p-3.5 shadow-md shadow-amber-500/10 hover:shadow-lg hover:shadow-amber-500/20 transition-all flex flex-col justify-between min-h-[105px]">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-amber-100/90 uppercase tracking-wider">Status Kesiapan Dapur</span>
                        <div className="p-1 rounded-lg bg-white/20 text-white">
                            <CookingPot className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        {stats.meal_prep_status === 'Ready' && (
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5">
                                    <div className="relative flex h-2 w-2 shrink-0">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </div>
                                    <span className="text-[10px] font-extrabold text-teal-800 bg-white px-2 py-0.5 rounded shadow-sm">SIAP LAYAN</span>
                                </div>
                                <p className="text-[9px] text-amber-50/80 font-bold ml-3.5">Tenaga Gizi & Juru Masak hadir</p>
                            </div>
                        )}
                        {stats.meal_prep_status === 'Cooking' && (
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5">
                                    <div className="relative flex h-2 w-2 shrink-0">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                                    </div>
                                    <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded shadow-sm">SEDANG MASAK</span>
                                </div>
                                <p className="text-[9px] text-amber-50/80 font-bold ml-3.5">Belum diverifikasi Tenaga Gizi</p>
                            </div>
                        )}
                        {stats.meal_prep_status === 'Pending' && (
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5">
                                    <div className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                                    <span className="text-[10px] font-extrabold text-rose-800 bg-rose-50 px-2 py-0.5 rounded shadow-sm">BELUM MULAI</span>
                                </div>
                                <p className="text-[9px] text-amber-50/80 font-bold ml-3.5">Juru Masak belum check-in</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Monthly Payroll Total */}
                <div className="bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white rounded-xl p-3.5 shadow-md shadow-fuchsia-500/10 hover:shadow-lg hover:shadow-fuchsia-500/20 transition-all flex flex-col justify-between min-h-[105px]">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-fuchsia-100/90 uppercase tracking-wider">Payroll Mei 2026 (Lalu)</span>
                        <div className="p-1 rounded-lg bg-white/20 text-white">
                            <DollarSign className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-base font-extrabold text-white leading-none mb-1 truncate">{formatRupiah(stats.total_payroll)}</h3>
                        <p className="text-[9px] text-fuchsia-50/80 font-semibold">Total pengeluaran terbayar</p>
                    </div>
                </div>
            </div>

            {/* Main Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                
                {/* Recent Scans & Distribution Realization Widget (Left 2 columns) */}
                <div className="lg:col-span-2 space-y-5">
                    
                    {/* Widget Laporan Realisasi Distribusi Bulanan (Trend Chart) */}
                    <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2">
                            <div>
                                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Laporan Realisasi Distribusi Bulanan</h3>
                                <p className="text-[9px] text-slate-400 font-medium mt-0.5">Tren alokasi & keberhasilan pengiriman gizi 30 hari terakhir</p>
                            </div>
                            <Link 
                                href="/realisasi-distribusi" 
                                className="text-[10px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
                            >
                                Laporan Lengkap
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        
                        {distributionHistory.length === 0 ? (
                            <p className="text-xs text-slate-400 font-bold py-6 text-center">Belum ada data histori log distribusi gizi.</p>
                        ) : (() => {
                            // SVG dimensions
                            const w = 550;
                            const h = 180;
                            const paddingLeft = 30;
                            const paddingRight = 15;
                            const paddingTop = 15;
                            const paddingBottom = 25;

                            // Scale factors
                            const maxVal = Math.max(300, ...distributionHistory.map(d => Math.max(d.total_target || 0, d.total_delivered || 0)));
                            
                            // Generate point paths
                            const ptsTarget = [];
                            const ptsDelivered = [];
                            const ptsRatio = [];

                            distributionHistory.forEach((d, idx) => {
                                const x = paddingLeft + (idx * (w - paddingLeft - paddingRight)) / (distributionHistory.length - 1 || 1);
                                
                                // Y for target line
                                const yTarget = h - paddingBottom - ((d.total_target || 0) / maxVal) * (h - paddingTop - paddingBottom);
                                ptsTarget.push({ x, y: yTarget });

                                // Y for delivered line
                                const yDelivered = h - paddingBottom - ((d.total_delivered || 0) / maxVal) * (h - paddingTop - paddingBottom);
                                ptsDelivered.push({ x, y: yDelivered });

                                // Y for ratio line (0-100% scaled to height)
                                const ratio = d.total_target > 0 ? (d.total_delivered / d.total_target) : 0;
                                const yRatio = h - paddingBottom - ratio * (h - paddingTop - paddingBottom);
                                ptsRatio.push({ x, y: yRatio });
                            });

                            const makePath = (pts) => pts.length > 0 ? `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') : '';
                            const pathTarget = makePath(ptsTarget);
                            const pathDelivered = makePath(ptsDelivered);
                            const pathRatio = makePath(ptsRatio);

                            // Select a few labels for X axis
                            const labelIndices = [];
                            if (distributionHistory.length > 0) {
                                labelIndices.push(0);
                                if (distributionHistory.length > 2) {
                                    labelIndices.push(Math.floor(distributionHistory.length / 2));
                                }
                                labelIndices.push(distributionHistory.length - 1);
                            }

                            return (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <svg className="w-full h-auto" viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
                                            {/* Y-Axis Gridlines */}
                                            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                                                const y = h - paddingBottom - ratio * (h - paddingTop - paddingBottom);
                                                const valLabel = Math.round(ratio * maxVal);
                                                return (
                                                    <g key={idx} className="opacity-40">
                                                        <line x1={paddingLeft} y1={y} x2={w - paddingRight} y2={y} stroke="#e2e8f0" strokeDasharray="3,3" strokeWidth="1" />
                                                        <text x={paddingLeft - 6} y={y + 3} className="text-[8px] font-bold fill-slate-400 text-right" textAnchor="end">{valLabel}</text>
                                                    </g>
                                                );
                                            })}

                                            {/* Target Curve (Dark Slate Navy) */}
                                            <path d={pathTarget} fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                            
                                            {/* Terkirim Curve (Teal) */}
                                            <path d={pathDelivered} fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                                            {/* Rasio Keberhasilan Curve (Orange) */}
                                            <path d={pathRatio} fill="none" stroke="#ea580c" strokeWidth="2" strokeDasharray="3,2" strokeLinecap="round" strokeLinejoin="round" />

                                            {/* X-Axis Labels */}
                                            {labelIndices.map(idx => {
                                                const d = distributionHistory[idx];
                                                const x = paddingLeft + (idx * (w - paddingLeft - paddingRight)) / (distributionHistory.length - 1 || 1);
                                                return (
                                                    <g key={idx}>
                                                        <line x1={x} y1={h - paddingBottom} x2={x} y2={h - paddingBottom + 4} stroke="#cbd5e1" strokeWidth="1" />
                                                        <text x={x} y={h - paddingBottom + 12} className="text-[7.5px] font-semibold fill-slate-400" textAnchor="middle">
                                                            {d.date}
                                                        </text>
                                                    </g>
                                                );
                                            })}
                                        </svg>
                                    </div>

                                    {/* Chart Legend */}
                                    <div className="flex flex-wrap items-center justify-center gap-5 pt-1 text-[9px] font-extrabold text-slate-500 border-t border-slate-50">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-4 h-1 bg-[#1e293b] rounded inline-block" />
                                            <span>Target Porsi</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-4 h-1 bg-[#0d9488] rounded inline-block" />
                                            <span>Porsi Terkirim</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-4 h-0.5 border-t-2 border-dashed border-[#ea580c] inline-block" />
                                            <span>Rasio Keberhasilan</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Recent Scans */}
                    <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
                            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Riwayat Scan Terbaru</h3>
                            <Link 
                                href="/scanner" 
                                className="text-[10px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
                            >
                                Buka Scanner
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>

                        {recentScans.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <Clock className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                                <p className="text-[11px] font-bold">Belum ada riwayat scan presensi hari ini</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase">
                                            <th className="py-2">Karyawan</th>
                                            <th className="py-2">Posisi</th>
                                            <th className="py-2">Tanggal</th>
                                            <th className="py-2 text-center">Masuk</th>
                                            <th className="py-2 text-center">Pulang</th>
                                            <th className="py-2 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {recentScans.map((scan) => (
                                            <tr key={scan.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-2.5 font-bold text-slate-900">
                                                    {scan.name}
                                                    <span className="block text-[9px] text-slate-400 font-medium tabular-nums">{scan.nip}</span>
                                                </td>
                                                <td className="py-2.5 text-slate-600 font-semibold">{scan.role}</td>
                                                <td className="py-2.5 text-slate-500 font-medium">{scan.date}</td>
                                                <td className="py-2.5 text-center font-bold text-slate-700 tabular-nums">{scan.clock_in}</td>
                                                <td className="py-2.5 text-center font-bold text-slate-700 tabular-nums">{scan.clock_out}</td>
                                                <td className="py-2.5 text-right">
                                                    <span className={`inline-block text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                                                        scan.status === 'Present' 
                                                            ? 'bg-teal-50 text-teal-700 border border-teal-100' 
                                                            : scan.status === 'Late' 
                                                            ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                                                            : scan.status === 'Leave'
                                                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                                                    }`}>
                                                        {scan.status === 'Present' && 'Masuk'}
                                                        {scan.status === 'Late' && `Terlambat (${formatMinutesDuration(scan.late_minutes)})`}
                                                        {scan.status === 'Leave' && 'Izin'}
                                                        {scan.status === 'Absent' && 'Mangkir'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

                {/* SPPG Unit Details (Right Column) */}
                <div className="space-y-4">
                    
                    {/* Graphic Chart: Target vs Realisasi Distribusi */}
                    <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2.5 border-b border-slate-50 pb-1.5 flex items-center justify-between">
                            <span>Realisasi Distribusi Harian</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${allocationPercentage === 100 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                {allocationPercentage}%
                            </span>
                        </h3>
                        <div className="flex items-center gap-4 py-1">
                            {/* SVG Radial Chart */}
                            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                                    <circle
                                        cx="40"
                                        cy="40"
                                        r={chartRadius}
                                        fill="none"
                                        stroke="#f1f5f9"
                                        strokeWidth="6"
                                    />
                                    <circle
                                        cx="40"
                                        cy="40"
                                        r={chartRadius}
                                        fill="none"
                                        stroke={allocationPercentage === 100 ? '#10b981' : '#3b82f6'}
                                        strokeWidth="6"
                                        strokeDasharray={chartCircumference}
                                        strokeDashoffset={chartStrokeDashoffset}
                                        strokeLinecap="round"
                                        className="transition-all duration-500 ease-out"
                                    />
                                </svg>
                                <div className="absolute text-center">
                                    <span className="block text-xs font-black text-slate-800 leading-none">{totalAllocated}</span>
                                    <span className="text-[7px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Porsi</span>
                                </div>
                            </div>

                            {/* Metrics list */}
                            <div className="flex-1 space-y-1.5">
                                <div>
                                    <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                                        <span>Target Harian</span>
                                        <span className="text-slate-700 tabular-nums">{mealTarget} porsi</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-0.5 overflow-hidden">
                                        <div className="bg-slate-400 h-full rounded-full" style={{ width: '100%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                                        <span>Terdistribusi</span>
                                        <span className={`${totalAllocated === mealTarget ? 'text-emerald-600' : 'text-blue-600'} tabular-nums`}>{totalAllocated} porsi</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-0.5 overflow-hidden">
                                        <div className={`h-full rounded-full ${totalAllocated === mealTarget ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${allocationPercentage}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location Details (mini legend) */}
                        {distributionPoints.length > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-slate-50 space-y-1.5">
                                <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Detail Titik Sekolah Penerima</span>
                                <div className="max-h-24 overflow-y-auto pr-1 space-y-1">
                                    {distributionPoints.map((point) => {
                                        const pct = mealTarget > 0 ? Math.round((point.qty / mealTarget) * 100) : 0;
                                        return (
                                            <div key={point.id} className="flex items-center justify-between text-[10px] bg-slate-50 p-1.5 rounded border border-slate-100/50">
                                                <span className="font-bold text-slate-700 truncate max-w-[130px]">{point.name}</span>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-extrabold text-slate-800 tabular-nums">{point.qty} Porsi</span>
                                                    <span className="text-[8px] text-slate-400 font-bold">({pct}%)</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Unit Info Card */}
                    <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-50 pb-1.5">
                            Identitas SPPG
                        </h3>
                        <div className="space-y-2.5 text-xs">
                            <div>
                                <span className="block text-[9px] text-slate-400 font-bold uppercase">Nama Unit Pelayanan</span>
                                <span className="font-bold text-slate-800">{settings.office_name || 'SPPG Sukajadi Mandiri'}</span>
                            </div>
                            <div>
                                <span className="block text-[9px] text-slate-400 font-bold uppercase">Target Distribusi Harian</span>
                                <span className="font-extrabold text-slate-900 text-sm">
                                    {settings.meal_target || '250'} <span className="text-[10px] text-slate-500 font-normal">Porsi Makan Bergizi Gratis</span>
                                </span>
                            </div>
                            <div>
                                <span className="block text-[9px] text-slate-400 font-bold uppercase">Program Pendukung</span>
                                <span className="font-bold text-slate-700">MBG (Makan Bergizi Gratis) Indonesia</span>
                            </div>
                        </div>
                    </div>

                    {/* Operational Shift Card */}
                    <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-50 pb-1.5">
                            Jadwal Shift Dapur
                        </h3>
                        <div className="space-y-2.5 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600 font-semibold">Batas Awal Masuk:</span>
                                <span className="font-bold text-slate-900 tabular-nums">{settings.work_start_time || '06:00'} WIB</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600 font-semibold">Batas Toleransi (Grace Time):</span>
                                <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 tabular-nums">{settings.late_grace_time || '06:30'} WIB</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600 font-semibold">Denda Keterlambatan:</span>
                                <span className="font-bold text-slate-800">{formatRupiah(settings.late_penalty_per_minute || 1000)} / menit</span>
                            </div>
                            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[9px] text-slate-500 leading-normal">
                                <strong>Ketentuan SPPG:</strong> Juru masak dan asisten masak disarankan hadir sebelum pukul {settings.work_start_time || '06:00'} untuk memulai persiapan bahan makanan program sarapan & makan siang sekolah.
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </MainLayout>
    );
}
