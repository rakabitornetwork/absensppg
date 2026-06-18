import React, { useState } from 'react';
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
    const [hoveredIdx, setHoveredIdx] = useState(null);
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
                    
                    {/* Widget Laporan Realisasi Distribusi Bulanan (Trend Chart) - PREMIUM AREA CHART */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm relative overflow-visible">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-50 pb-3">
                            <div>
                                <span className="text-[9px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded uppercase tracking-wider">Tren Bulanan</span>
                                <h3 className="text-sm font-extrabold text-slate-900 mt-1">Laporan Realisasi Distribusi Bulanan</h3>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Tren alokasi & keberhasilan pengiriman gizi 30 hari terakhir</p>
                            </div>
                            <Link 
                                href="/realisasi-distribusi" 
                                className="text-[10px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors bg-slate-50 hover:bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-slate-100"
                            >
                                Laporan Lengkap
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                        
                        {distributionHistory.length === 0 ? (
                            <p className="text-xs text-slate-400 font-bold py-8 text-center">Belum ada data histori log distribusi gizi.</p>
                        ) : (() => {
                            // SVG dimensions
                            const w = 600;
                            const h = 200;
                            const paddingLeft = 45;
                            const paddingRight = 15;
                            const paddingTop = 15;
                            const paddingBottom = 30;

                            // Scale factors
                            const maxVal = Math.max(300, ...distributionHistory.map(d => Math.max(d.total_target || 0, d.total_delivered || 0)));
                            
                            // Helper to format date like "18 Jun 2026"
                            const formatDateLabel = (dateStr) => {
                                try {
                                    const parts = dateStr.split('-');
                                    if (parts.length === 3) {
                                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
                                        const day = parseInt(parts[2], 10);
                                        const monthIdx = parseInt(parts[1], 10) - 1;
                                        return `${day} ${months[monthIdx]} ${parts[0]}`;
                                    }
                                    return dateStr;
                                } catch (e) {
                                    return dateStr;
                                }
                            };

                            const formatFullDate = (dateStr) => {
                                try {
                                    const parts = dateStr.split('-');
                                    if (parts.length === 3) {
                                        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                                        const day = parseInt(parts[2], 10);
                                        const monthIdx = parseInt(parts[1], 10) - 1;
                                        return `${day} ${months[monthIdx]} ${parts[0]}`;
                                    }
                                    return dateStr;
                                } catch (e) {
                                    return dateStr;
                                }
                            };

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

                            // Smooth Bezier Curve Path Generator
                            const makeBezierPath = (pts) => {
                                if (pts.length === 0) return '';
                                if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
                                let d = `M ${pts[0].x} ${pts[0].y}`;
                                for (let i = 0; i < pts.length - 1; i++) {
                                    const p0 = pts[i];
                                    const p1 = pts[i + 1];
                                    const cpX1 = p0.x + (p1.x - p0.x) / 3;
                                    const cpY1 = p0.y;
                                    const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
                                    const cpY2 = p1.y;
                                    d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
                                }
                                return d;
                            };

                            const makeAreaPath = (pts) => {
                                if (pts.length === 0) return '';
                                const first = pts[0];
                                const last = pts[pts.length - 1];
                                let d = makeBezierPath(pts);
                                d += ` L ${last.x} ${h - paddingBottom} L ${first.x} ${h - paddingBottom} Z`;
                                return d;
                            };

                            const pathTarget = makeBezierPath(ptsTarget);
                            const pathDelivered = makeBezierPath(ptsDelivered);
                            const pathRatio = makeBezierPath(ptsRatio);

                            const areaTarget = makeAreaPath(ptsTarget);
                            const areaDelivered = makeAreaPath(ptsDelivered);

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
                                <div className="space-y-5 relative">
                                    {/* SVG Container */}
                                    <div className="relative">
                                        <svg className="w-full h-auto" viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
                                            <defs>
                                                {/* Areas Gradients */}
                                                <linearGradient id="deliveredAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                                </linearGradient>
                                                <linearGradient id="targetAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
                                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                                                </linearGradient>
                                                {/* Dropshadow for lines */}
                                                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                                    <feGaussianBlur stdDeviation="2" result="blur" />
                                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                                </filter>
                                            </defs>

                                            {/* Y-Axis Gridlines */}
                                            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                                                const y = h - paddingBottom - ratio * (h - paddingTop - paddingBottom);
                                                const valLabel = Math.round(ratio * maxVal);
                                                return (
                                                    <g key={idx}>
                                                        <line x1={paddingLeft} y1={y} x2={w - paddingRight} y2={y} stroke="#f1f5f9" strokeDasharray="4,4" strokeWidth="1" />
                                                        <text x={paddingLeft - 10} y={y + 3} className="font-sans text-[6.5px] font-medium fill-slate-400 text-right" textAnchor="end" fontSize="6.5">{valLabel}</text>
                                                    </g>
                                                );
                                            })}

                                            {/* Filled Area paths */}
                                            <path d={areaTarget} fill="url(#targetAreaGrad)" />
                                            <path d={areaDelivered} fill="url(#deliveredAreaGrad)" />

                                            {/* Curves */}
                                            {/* Target Curve */}
                                            <path d={pathTarget} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            
                                            {/* Delivered Curve */}
                                            <path d={pathDelivered} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />

                                            {/* Ratio Curve */}
                                            <path d={pathRatio} fill="none" stroke="#f97316" strokeWidth="1.5" strokeDasharray="4,3" strokeLinecap="round" strokeLinejoin="round" />

                                            {/* X-Axis Labels */}
                                            {labelIndices.map(idx => {
                                                const d = distributionHistory[idx];
                                                const x = paddingLeft + (idx * (w - paddingLeft - paddingRight)) / (distributionHistory.length - 1 || 1);
                                                return (
                                                    <g key={idx}>
                                                        <line x1={x} y1={h - paddingBottom} x2={x} y2={h - paddingBottom + 5} stroke="#e2e8f0" strokeWidth="1" />
                                                        <text x={x} y={h - paddingBottom + 15} className="font-sans text-[6.5px] font-medium fill-slate-400" textAnchor="middle" fontSize="6.5">
                                                            {formatDateLabel(d.date)}
                                                        </text>
                                                    </g>
                                                );
                                            })}

                                            {/* Hover Vertical Guide Line & Interactive Markers */}
                                            {hoveredIdx !== null && ptsTarget[hoveredIdx] && (
                                                <g>
                                                    {/* Vertical indicator line */}
                                                    <line 
                                                        x1={ptsTarget[hoveredIdx].x} 
                                                        y1={paddingTop} 
                                                        x2={ptsTarget[hoveredIdx].x} 
                                                        y2={h - paddingBottom} 
                                                        stroke="#cbd5e1" 
                                                        strokeDasharray="3,3" 
                                                        strokeWidth="1.5" 
                                                    />

                                                    {/* Target dot marker */}
                                                    <circle cx={ptsTarget[hoveredIdx].x} cy={ptsTarget[hoveredIdx].y} r="5" fill="#ffffff" stroke="#3b82f6" strokeWidth="2" />
                                                    <circle cx={ptsTarget[hoveredIdx].x} cy={ptsTarget[hoveredIdx].y} r="2" fill="#3b82f6" />

                                                    {/* Delivered dot marker */}
                                                    <circle cx={ptsDelivered[hoveredIdx].x} cy={ptsDelivered[hoveredIdx].y} r="6" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
                                                    <circle cx={ptsDelivered[hoveredIdx].x} cy={ptsDelivered[hoveredIdx].y} r="2.5" fill="#10b981" />
                                                </g>
                                            )}

                                            {/* Invisible Hover Rect to capture mouse interaction */}
                                            <rect
                                                x={paddingLeft}
                                                y={paddingTop}
                                                width={w - paddingLeft - paddingRight}
                                                height={h - paddingTop - paddingBottom}
                                                fill="transparent"
                                                style={{ cursor: 'crosshair' }}
                                                onMouseMove={(e) => {
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    const mouseX = e.clientX - rect.left;
                                                    const svgX = (mouseX / rect.width) * (w - paddingLeft - paddingRight) + paddingLeft;
                                                    
                                                    let closestIdx = 0;
                                                    let minDiff = Infinity;
                                                    ptsTarget.forEach((pt, idx) => {
                                                        const diff = Math.abs(pt.x - svgX);
                                                        if (diff < minDiff) {
                                                            minDiff = diff;
                                                            closestIdx = idx;
                                                        }
                                                    });
                                                    setHoveredIdx(closestIdx);
                                                }}
                                                onMouseLeave={() => setHoveredIdx(null)}
                                            />
                                        </svg>

                                        {/* Floating Glassmorphic Tooltip Card */}
                                        {hoveredIdx !== null && distributionHistory[hoveredIdx] && (
                                            <div 
                                                className="absolute pointer-events-none bg-white/90 backdrop-blur-md text-slate-800 border border-slate-100 rounded-xl p-3 shadow-xl text-[10px] space-y-1.5 z-30 transition-all duration-150 w-44"
                                                style={{
                                                    left: `${((ptsTarget[hoveredIdx].x - paddingLeft) / (w - paddingLeft - paddingRight)) * 100}%`,
                                                    top: '15px',
                                                    transform: 'translateX(-50%)',
                                                }}
                                            >
                                                <div className="font-extrabold text-slate-900 border-b border-slate-100 pb-1 mb-1 text-[9px] uppercase tracking-wider">
                                                    {formatFullDate(distributionHistory[hoveredIdx].date)}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-400 font-bold flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Target:
                                                    </span>
                                                    <span className="font-extrabold text-slate-800 tabular-nums">{distributionHistory[hoveredIdx].total_target || 0} porsi</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-teal-600 font-bold flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Terkirim:
                                                    </span>
                                                    <span className="font-extrabold text-teal-600 tabular-nums">{distributionHistory[hoveredIdx].total_delivered || 0} porsi</span>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-slate-50 pt-1.5 mt-1.5">
                                                    <span className="text-orange-600 font-bold flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Rasio Sukses:
                                                    </span>
                                                    <span className="font-black text-orange-600 tabular-nums">
                                                        {distributionHistory[hoveredIdx].total_target > 0 
                                                            ? Math.round((distributionHistory[hoveredIdx].total_delivered / distributionHistory[hoveredIdx].total_target) * 100) 
                                                            : 0}%
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Chart Legend / Metadata */}
                                    <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-[10px] font-bold text-slate-500 border-t border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <span className="w-3.5 h-1.5 bg-blue-500 rounded-full inline-block" />
                                            <span>Target Porsi</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-3.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
                                            <span>Porsi Terkirim</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-3.5 h-0.5 border-t-2 border-dashed border-orange-500 inline-block" />
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
