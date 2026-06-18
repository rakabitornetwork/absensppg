import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import MainLayout from '../Layout/MainLayout';
import { 
    TrendingUp, 
    Calendar, 
    CheckCircle2, 
    Clock, 
    Lock, 
    MapPin, 
    Utensils, 
    ChevronRight,
    Award,
    AlertCircle,
    Printer,
    FileSpreadsheet,
    Unlock,
    Trash2
} from 'lucide-react';

export default function DistributionRealizations({ todayConfig = {}, history = [], shifts = [], systemSettings = {} }) {
    const { props } = usePage();
    const userRole = props.auth?.user?.role || 'admin';
    const [activeTab, setActiveTab] = useState('daily'); // 'daily' or 'monthly'
    const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

    // Find the shift for cooking, usually "Shift Pagi" or contains "Pagi" or "Masak"
    const cookingShift = shifts.find(s => 
        s.name.toLowerCase().includes('pagi') || 
        s.name.toLowerCase().includes('masak')
    ) || shifts[0] || { name: 'Shift Pagi', start_time: '05:00', end_time: '13:00' };

    const mealTarget = todayConfig.meal_target || 250;
    const totalDelivered = todayConfig.total_delivered || 0;
    const allocationPercentage = mealTarget > 0 ? Math.min(100, Math.round((totalDelivered / mealTarget) * 100)) : 0;

    // Calculate monthly aggregates from history
    const totalDeliveredMonthly = history.reduce((sum, item) => sum + (item.total_delivered || 0), 0);
    const averageSuccessRate = history.length > 0 
        ? Math.round(history.reduce((sum, item) => sum + (item.total_target > 0 ? (item.total_delivered / item.total_target) * 100 : 0), 0) / history.length)
        : 0;

    // SVG Chart Calculations for past 30 days
    const chartData = [...history].reverse(); // oldest to newest
    const chartWidth = 500;
    const chartHeight = 120;
    const padding = 15;
    
    // Find max value for scaling
    const maxVal = Math.max(300, ...chartData.map(d => d.total_delivered || 0));
    
    // Generate SVG path points
    const points = chartData.map((d, index) => {
        const x = padding + (index * (chartWidth - 2 * padding)) / (chartData.length - 1 || 1);
        const y = chartHeight - padding - ((d.total_delivered || 0) / maxVal) * (chartHeight - 2 * padding);
        return { x, y, val: d.total_delivered, date: d.date };
    });

    const pathD = points.length > 0 
        ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') 
        : '';
        
    const areaD = points.length > 0
        ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`
        : '';

    const handleLockRealisasi = () => {
        if (confirm('Kunci realisasi distribusi hari ini? Data tidak akan bisa diedit setelah dikunci.')) {
            router.post('/realisasi-distribusi/lock');
        }
    };

    const handleUnlockRealisasi = (redirectToTarget = false) => {
        const msg = redirectToTarget 
            ? 'Buka kunci laporan dan edit target distribusi hari ini?' 
            : 'Apakah Anda yakin ingin menghapus / membuka kunci laporan hari ini?';
        if (confirm(msg)) {
            router.post('/realisasi-distribusi/unlock', redirectToTarget ? { redirect_to_target: 1 } : {});
        }
    };

    return (
        <MainLayout title="Realisasi Distribusi">
            <Head title="Realisasi Distribusi Harian & Bulanan" />

            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header & Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                        <h2 className="text-sm font-extrabold text-slate-900 leading-none mb-1 font-sans">Laporan Realisasi Gizi & Makanan</h2>
                        <p className="text-[10px] text-slate-500 font-medium">Lacak pengantaran sarapan & makan siang sekolah terverifikasi</p>
                    </div>
                    
                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0 self-start sm:self-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab('daily')}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                                activeTab === 'daily' 
                                    ? 'bg-white text-slate-900 shadow-xs' 
                                    : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            Realisasi Harian
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('monthly')}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                                activeTab === 'monthly' 
                                    ? 'bg-white text-slate-900 shadow-xs' 
                                    : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            Laporan Bulanan
                        </button>
                    </div>
                </div>

                {/* Tab 1: Realisasi Harian */}
                {activeTab === 'daily' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Realization Progress Box */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Summary & Lock Action */}
                            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white rounded-xl p-5 shadow-md shadow-slate-950/20 space-y-5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-teal-400" />
                                        <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Status Realisasi Hari Ini</h3>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                                        Tanggal: {todayConfig.date}
                                    </span>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    {/* Radial Progress Gauge */}
                                    <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="8" />
                                            <circle 
                                                cx="50" 
                                                cy="50" 
                                                r="42" 
                                                fill="none" 
                                                stroke={allocationPercentage === 100 ? '#10b981' : '#60a5fa'} 
                                                strokeWidth="8" 
                                                strokeDasharray={2 * Math.PI * 42}
                                                strokeDashoffset={2 * Math.PI * 42 * (1 - allocationPercentage / 100)}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute text-center">
                                            <span className="block text-base font-black text-white tabular-nums">{allocationPercentage}%</span>
                                            <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">Tiba</span>
                                        </div>
                                    </div>

                                    {/* Target vs Realized stats */}
                                    <div className="flex-1 w-full space-y-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
                                                <span className="block text-[8px] font-bold text-slate-400 uppercase">Target Distribusi</span>
                                                <span className="text-sm font-black text-white tabular-nums">{mealTarget} <span className="text-[9px] font-normal text-slate-400">Porsi</span></span>
                                            </div>
                                            <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
                                                <span className="block text-[8px] font-bold text-slate-400 uppercase">Tiba di Lokasi</span>
                                                <span className="text-sm font-black text-teal-400 tabular-nums">{totalDelivered} <span className="text-[9px] font-normal text-slate-400">Porsi</span></span>
                                            </div>
                                        </div>

                                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-500 ${allocationPercentage === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                                style={{ width: `${allocationPercentage}%` }} 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Lock action bar */}
                                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-1.5">
                                        {todayConfig.is_locked ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Laporan Dikunci
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                                                <AlertCircle className="w-3.5 h-3.5" /> Menunggu Kunci
                                            </span>
                                        )}
                                        <p className="text-[9px] text-slate-400 font-medium hidden md:inline">
                                            {todayConfig.is_locked 
                                                ? 'Data hari ini telah dikunci untuk laporan resmi.' 
                                                : 'Kunci data jika pengiriman gizi hari ini sudah selesai dilakukan.'}
                                        </p>
                                    </div>

                                    {!todayConfig.is_locked && (userRole === 'superadmin' || userRole === 'admin') && (
                                        <button
                                            type="button"
                                            onClick={handleLockRealisasi}
                                            className="bg-white hover:bg-slate-100 text-slate-900 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                                        >
                                            <Lock className="w-3 h-3" />
                                            Kunci Realisasi Hari Ini
                                        </button>
                                    )}

                                    {todayConfig.is_locked && userRole === 'superadmin' && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleUnlockRealisasi(true)}
                                                className="bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                                            >
                                                <Unlock className="w-3 h-3" />
                                                Edit Laporan
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleUnlockRealisasi(false)}
                                                className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                Hapus Laporan
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Delivery Points Details */}
                            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
                                <div className="border-b border-slate-50 pb-2 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-teal-600" />
                                        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Log Detail Lokasi & Waktu Pengantaran</h3>
                                    </div>
                                </div>

                                <div className="divide-y divide-slate-50 space-y-2">
                                    {todayConfig.points.length === 0 ? (
                                        <p className="text-xs font-semibold text-slate-400 text-center py-4">Belum ada titik penerima yang dikonfigurasi.</p>
                                    ) : (
                                        todayConfig.points.map((point) => (
                                            <div key={point.id} className="flex items-center justify-between py-2.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`p-2 rounded-lg ${point.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                        <MapPin className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <span className="block text-xs font-bold text-slate-800">{point.name}</span>
                                                        <span className="block text-[8px] font-bold text-slate-400 uppercase">Target: {point.qty} Porsi</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-md ${
                                                            point.status === 'Delivered'
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                                : point.status === 'In Progress'
                                                                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                        }`}>
                                                            {point.status === 'Delivered' && 'Tiba di Lokasi'}
                                                            {point.status === 'In Progress' && 'Dalam Perjalanan'}
                                                            {point.status === 'Pending' && 'Pending'}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 text-slate-600 w-20 justify-end">
                                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="text-[10px] font-bold tabular-nums">
                                                            {point.delivered_at || (point.status === 'Delivered' ? '09:00' : '-')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Today's Gizi Menu Sidebar card */}
                        <div className="space-y-6">
                            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
                                <div className="border-b border-slate-50 pb-2 flex items-center gap-2">
                                    <Utensils className="w-4 h-4 text-teal-600" />
                                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Komposisi Menu Gizi Hari Ini</h3>
                                </div>

                                <div className="space-y-3 text-xs">
                                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                        <span className="block text-[8px] font-extrabold text-slate-400 uppercase mb-0.5">Karbohidrat</span>
                                        <span className="font-bold text-slate-800">{todayConfig.menu.carbohydrate}</span>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                        <span className="block text-[8px] font-extrabold text-slate-400 uppercase mb-0.5">Lauk Hewani (Protein)</span>
                                        <span className="font-bold text-slate-800">{todayConfig.menu.protein_hewan}</span>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                        <span className="block text-[8px] font-extrabold text-slate-400 uppercase mb-0.5">Lauk Nabati (Protein)</span>
                                        <span className="font-bold text-slate-800">{todayConfig.menu.protein_nabati}</span>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                        <span className="block text-[8px] font-extrabold text-slate-400 uppercase mb-0.5">Sayuran (Vitamin & Serat)</span>
                                        <span className="font-bold text-slate-800">{todayConfig.menu.vegetable}</span>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                        <span className="block text-[8px] font-extrabold text-slate-400 uppercase mb-0.5">Minuman / Buah</span>
                                        <span className="font-bold text-slate-800">{todayConfig.menu.beverage}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Daily Operational Report Card */}
                            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
                                <div className="border-b border-slate-50 pb-2 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-teal-600" />
                                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Laporan Harian Dapur & Operasional</h3>
                                </div>

                                <div className="space-y-3 text-xs">
                                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex justify-between items-center">
                                        <div>
                                            <span className="block text-[8px] font-extrabold text-slate-400 uppercase mb-0.5">Shift Kerja Masak</span>
                                            <span className="font-bold text-slate-800">{cookingShift.name}</span>
                                        </div>
                                        <span className="text-[9px] font-extrabold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                                            {cookingShift.start_time.substring(0, 5)} - {cookingShift.end_time.substring(0, 5)}
                                        </span>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex justify-between items-center">
                                        <div>
                                            <span className="block text-[8px] font-extrabold text-slate-400 uppercase mb-0.5">Persiapan Masak Dimulai</span>
                                            <span className="font-bold text-slate-800">Tepat Waktu (Sebelum 06:00)</span>
                                        </div>
                                        <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">05:30 WIB</span>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex justify-between items-center">
                                        <div>
                                            <span className="block text-[8px] font-extrabold text-slate-400 uppercase mb-0.5">Higienitas & Kebersihan</span>
                                            <span className="font-bold text-slate-800">Sesuai Standar Mutu Gizi</span>
                                        </div>
                                        <span className="text-[9px] font-extrabold bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-100">Higienis</span>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex justify-between items-center">
                                        <div>
                                            <span className="block text-[8px] font-extrabold text-slate-400 uppercase mb-0.5">Suhu Penyajian Makanan</span>
                                            <span className="font-bold text-slate-800">Terjaga Hangat</span>
                                        </div>
                                        <span className="text-[9px] font-extrabold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100">~65°C</span>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                        <span className="block text-[8px] font-extrabold text-slate-400 uppercase mb-1">Catatan Evaluasi Harian</span>
                                        <p className="text-[10px] text-slate-600 leading-relaxed font-semibold">
                                            Seluruh bahan segar dipersiapkan dengan baik. Distribusi dimulai tepat waktu agar gizi sarapan/siang tiba sebelum waktu istirahat sekolah.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* Tab 2: Laporan Bulanan */}
                {activeTab === 'monthly' && (
                    <div className="space-y-6">
                        
                        {/* Monthly Summary Statistics cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
                                <div>
                                    <span className="block text-[9px] text-slate-400 font-bold uppercase">Total Terkirim (30 Hari)</span>
                                    <span className="text-xl font-black text-slate-800 tabular-nums">{totalDeliveredMonthly} <span className="text-xs font-semibold text-slate-500">Porsi</span></span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600">
                                    <Award className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
                                <div>
                                    <span className="block text-[9px] text-slate-400 font-bold uppercase">Rata-rata Akurasi Target</span>
                                    <span className="text-xl font-black text-slate-800 tabular-nums">{averageSuccessRate}%</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
                                <div>
                                    <span className="block text-[9px] text-slate-400 font-bold uppercase">Hari Aktif Distribusi</span>
                                    <span className="text-xl font-black text-slate-800 tabular-nums">{history.length} <span className="text-xs font-semibold text-slate-500">Hari</span></span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                                    <Calendar className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* Graphic Area Chart */}
                        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
                            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-50 pb-2">Tren Porsi Sukses Terkirim (30 Hari Terakhir)</h3>
                            
                            {points.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-10 font-bold">Belum ada sejarah data distribusi.</p>
                            ) : (
                                <div className="w-full">
                                    <svg className="w-full h-auto overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                                        {/* Grid Lines */}
                                        <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#f1f5f9" strokeDasharray="3" />
                                        <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="#f1f5f9" strokeDasharray="3" />
                                        <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#e2e8f0" />
                                        
                                        {/* Area Fill */}
                                        <path d={areaD} fill="url(#chart-gradient)" opacity="0.15" />
                                        {/* Trend Line */}
                                        <path d={pathD} fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        
                                        {/* Gradient Def */}
                                        <defs>
                                            <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#0ea5e9" />
                                                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>

                                        {/* Interaction Dots */}
                                        {points.map((p, idx) => (
                                            <circle
                                                key={idx}
                                                cx={p.x}
                                                cy={p.y}
                                                r="3"
                                                fill="#ffffff"
                                                stroke="#0ea5e9"
                                                strokeWidth="2"
                                                className="cursor-pointer hover:r-5 transition-all"
                                                title={`Tanggal: ${p.date}, Porsi: ${p.val}`}
                                            />
                                        ))}
                                    </svg>
                                    <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-wider px-2.5 mt-2.5">
                                        <span>{chartData[0]?.date || ''}</span>
                                        <span>{chartData[Math.floor(chartData.length / 2)]?.date || ''}</span>
                                        <span>{chartData[chartData.length - 1]?.date || ''}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Historical Logs List */}
                        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Histori Laporan Log Distribusi</h3>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => {
                                            if (history.length === 0) return alert('Tidak ada data untuk diexport');
                                            const csvHeaders = ['Tanggal', 'Karbohidrat', 'Lauk Utama', 'Lauk Nabati', 'Sayur', 'Minuman', 'Target Porsi', 'Terkirim', 'Rasio Keberhasilan'];
                                            const csvRows = history.map(item => [
                                                item.date,
                                                item.menu_data?.carbohydrate || '',
                                                item.menu_data?.protein_hewan || '',
                                                item.menu_data?.protein_nabati || '',
                                                item.menu_data?.vegetable || '',
                                                item.menu_data?.beverage || '',
                                                item.total_target,
                                                item.total_delivered,
                                                `${item.total_target > 0 ? Math.round((item.total_delivered / item.total_target) * 100) : 0}%`
                                            ]);
                                            const csvContent = "\uFEFF" + [csvHeaders, ...csvRows].map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
                                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                            const url = URL.createObjectURL(blob);
                                            const link = document.createElement("a");
                                            link.setAttribute("href", url);
                                            link.setAttribute("download", `Histori_Log_Distribusi_${new Date().toISOString().slice(0,10)}.csv`);
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                        }}
                                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors" 
                                        title="Export Excel"
                                    >
                                        <FileSpreadsheet className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            const appName = systemSettings.office_name || 'SPPG SUKAJADI';
                                            const logoUrl = systemSettings.app_logo ? window.location.origin + systemSettings.app_logo : '';
                                            const officeAddress = systemSettings.office_address || '';
                                            const officeEmail = systemSettings.office_email || '';
                                            const officeWhatsapp = systemSettings.office_whatsapp || '';
                                            const printContent = `
                                                <html>
                                                    <head>
                                                        <title>Histori Laporan Log Distribusi - ${appName}</title>
                                                        <link rel="preconnect" href="https://fonts.googleapis.com">
                                                        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                                                        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
                                                        <style>
                                                            @media print {
                                                                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                                                                @page { 
                                                                    size: A4; 
                                                                    margin: 20mm 15mm 20mm 15mm; 
                                                                }
                                                            }
                                                            body { 
                                                                font-family: 'Plus Jakarta Sans', sans-serif; 
                                                                padding: 24px; 
                                                                margin: 0; 
                                                                color: #1e293b; 
                                                                background-color: #ffffff;
                                                                line-height: 1.5;
                                                            }
                                                            .header-container {
                                                                border-bottom: 3px double #0f766e;
                                                                padding-bottom: 20px;
                                                                margin-bottom: 30px;
                                                                display: flex;
                                                                align-items: center;
                                                                gap: 20px;
                                                            }
                                                            .logo-img {
                                                                width: 70px;
                                                                height: 70px;
                                                                object-fit: contain;
                                                                flex-shrink: 0;
                                                            }
                                                            .header-details {
                                                                flex-grow: 1;
                                                            }
                                                            .brand-title {
                                                                color: #0f766e;
                                                                font-size: 16px;
                                                                font-weight: 800;
                                                                text-transform: uppercase;
                                                                letter-spacing: 0.5px;
                                                                margin: 0 0 2px 0;
                                                            }
                                                            .brand-subtitle {
                                                                color: #0d9488;
                                                                font-size: 11px;
                                                                font-weight: 700;
                                                                margin: 0 0 6px 0;
                                                                letter-spacing: 0.5px;
                                                            }
                                                            .office-meta {
                                                                color: #64748b;
                                                                font-size: 9.5px;
                                                                font-weight: 500;
                                                                line-height: 1.4;
                                                            }
                                                            .document-meta {
                                                                text-align: right;
                                                                font-size: 9.5px;
                                                                color: #64748b;
                                                                font-weight: 500;
                                                                margin-left: auto;
                                                                border-left: 1px solid #e2e8f0;
                                                                padding-left: 15px;
                                                                height: 60px;
                                                                display: flex;
                                                                flex-direction: column;
                                                                justify-content: center;
                                                            }
                                                            table { 
                                                                width: 100%; 
                                                                border-collapse: collapse; 
                                                                margin-top: 10px; 
                                                            }
                                                            th, td { 
                                                                padding: 12px 14px; 
                                                                text-align: left; 
                                                                font-size: 11px; 
                                                                border-bottom: 1px solid #f1f5f9;
                                                            }
                                                            th { 
                                                                background-color: #f8fafc; 
                                                                color: #475569;
                                                                font-weight: 700; 
                                                                text-transform: uppercase;
                                                                letter-spacing: 0.5px;
                                                                border-bottom: 2px solid #e2e8f0;
                                                            }
                                                            tr:nth-child(even) td {
                                                                background-color: #fafafa;
                                                            }
                                                            .text-center { text-align: center; }
                                                            .font-mono { font-family: monospace; font-size: 11px; font-weight: 600; }
                                                            .success-pill { 
                                                                background-color: #ecfdf5 !important; 
                                                                color: #047857 !important; 
                                                                border: 1px solid #a7f3d0; 
                                                                padding: 3px 8px; 
                                                                border-radius: 6px; 
                                                                font-weight: 700; 
                                                                font-size: 10px;
                                                                display: inline-block;
                                                            }
                                                            .warning-pill { 
                                                                background-color: #fffbeb !important; 
                                                                color: #b45309 !important; 
                                                                border: 1px solid #fde68a; 
                                                                padding: 3px 8px; 
                                                                border-radius: 6px; 
                                                                font-weight: 700; 
                                                                font-size: 10px;
                                                                display: inline-block;
                                                            }
                                                            .menu-item {
                                                                font-weight: 600;
                                                                color: #334155;
                                                            }
                                                            .menu-sub {
                                                                font-size: 9.5px;
                                                                color: #64748b;
                                                                margin-top: 2px;
                                                            }
                                                        </style>
                                                    </head>
                                                    <body>
                                                        <div class="header-container">
                                                            ${logoUrl ? `<img src="${logoUrl}" class="logo-img" alt="Logo" />` : ''}
                                                            <div class="header-details">
                                                                <h1 class="brand-title">${appName}</h1>
                                                                <p class="brand-subtitle">Histori Laporan Log Realisasi Distribusi Gizi</p>
                                                                <div class="office-meta">
                                                                    ${officeAddress ? `<span>📍 ${officeAddress}</span>` : ''}
                                                                    ${officeEmail || officeWhatsapp ? '<br/>' : ''}
                                                                    ${officeEmail ? `<span>📧 ${officeEmail}</span>` : ''}
                                                                    ${officeEmail && officeWhatsapp ? '<span> | </span>' : ''}
                                                                    ${officeWhatsapp ? `<span>💬 WhatsApp: ${officeWhatsapp}</span>` : ''}
                                                                </div>
                                                            </div>
                                                            <div class="document-meta">
                                                                <b>LAPORAN RESMI</b>
                                                                <span>Dicetak: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                        </div>
                                                        <table>
                                                            <thead>
                                                                <tr>
                                                                    <th style="width: 15%">Tanggal</th>
                                                                    <th style="width: 55%">Menu Gizi</th>
                                                                    <th class="text-center" style="width: 10%">Target</th>
                                                                    <th class="text-center" style="width: 10%">Terkirim</th>
                                                                    <th class="text-center" style="width: 10%">Rasio</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                ${history.map(item => {
                                                                    const pct = item.total_target > 0 ? Math.round((item.total_delivered / item.total_target) * 100) : 0;
                                                                    const pillClass = pct === 100 ? 'success-pill' : 'warning-pill';
                                                                    return `
                                                                        <tr>
                                                                            <td><b class="font-mono">${item.date}</b></td>
                                                                            <td>
                                                                                <div class="menu-item">🍚 ${item.menu_data?.carbohydrate || 'Nasi'} & 🍗 ${item.menu_data?.protein_hewan || 'Lauk Utama'}</div>
                                                                                <div class="menu-sub">Lauk Nabati: ${item.menu_data?.protein_nabati || '-'} | Sayur: ${item.menu_data?.vegetable || '-'} | Minuman: ${item.menu_data?.beverage || '-'}</div>
                                                                            </td>
                                                                            <td class="text-center font-mono">${item.total_target}</td>
                                                                            <td class="text-center font-mono" style="color: #0f766e; font-weight: 700;">${item.total_delivered}</td>
                                                                            <td class="text-center"><span class="${pillClass}">${pct}%</span></td>
                                                                        </tr>
                                                                    `;
                                                                }).join('')}
                                                            </tbody>
                                                        </table>
                                                    </body>
                                                </html>
                                            `;
                                            const win = window.open('', '_blank');
                                            win.document.write(printContent);
                                            win.document.close();
                                            win.print();
                                        }}
                                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors" 
                                        title="Print PDF"
                                    >
                                        <Printer className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase">
                                            <th className="py-2">Tanggal</th>
                                            <th className="py-2">Karbohidrat / Lauk Utama</th>
                                            <th className="py-2 text-center">Target</th>
                                            <th className="py-2 text-center">Terkirim</th>
                                            <th className="py-2 text-center">Rasio Keberhasilan</th>
                                            <th className="py-2 text-right">Rincian</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 font-medium text-slate-600">
                                        {history.map((item) => {
                                            const pct = item.total_target > 0 ? Math.round((item.total_delivered / item.total_target) * 100) : 0;
                                            return (
                                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="py-2.5 font-bold text-slate-800 tabular-nums">{item.date}</td>
                                                    <td className="py-2.5 text-slate-700">
                                                        {item.menu_data?.carbohydrate || 'Nasi'} & {item.menu_data?.protein_hewan || 'Lauk'}
                                                    </td>
                                                    <td className="py-2.5 text-center tabular-nums">{item.total_target}</td>
                                                    <td className="py-2.5 text-center font-bold text-teal-600 tabular-nums">{item.total_delivered}</td>
                                                    <td className="py-2.5 text-center">
                                                        <span className={`inline-block text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                                                            pct === 100 
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                                : 'bg-amber-50 text-amber-700 border border-amber-100'
                                                        }`}>
                                                            {pct}%
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedHistoryItem(item)}
                                                            className="text-teal-600 hover:text-teal-700 font-bold flex items-center gap-0.5 justify-end ml-auto transition-colors"
                                                        >
                                                            Detail <ChevronRight className="w-3.5 h-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                )}

                {/* History Detail Modal */}
                {selectedHistoryItem && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white border border-slate-100 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                            {/* Header */}
                            <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                                <span className="text-xs font-extrabold text-slate-900 uppercase">Detail Log Realisasi: {selectedHistoryItem.date}</span>
                                <button
                                    onClick={() => setSelectedHistoryItem(null)}
                                    className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                                >
                                    Tutup
                                </button>
                            </div>
                            
                            {/* Body */}
                            <div className="p-5 space-y-4">
                                <div>
                                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase mb-1.5">Menu Gizi Disajikan</h4>
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs space-y-1 font-bold text-slate-700">
                                        <p>🍚 {selectedHistoryItem.menu_data?.carbohydrate}</p>
                                        <p>🍗 {selectedHistoryItem.menu_data?.protein_hewan}</p>
                                        <p>🍳 {selectedHistoryItem.menu_data?.protein_nabati}</p>
                                        <p>🥗 {selectedHistoryItem.menu_data?.vegetable}</p>
                                        <p>🥛 {selectedHistoryItem.menu_data?.beverage}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase mb-1.5">Laporan Titik Pengiriman</h4>
                                    <div className="space-y-2">
                                        {(selectedHistoryItem.points_data || []).map((point, index) => (
                                            <div key={index} className="flex items-center justify-between text-xs bg-slate-50/50 p-2 rounded border border-slate-100">
                                                <div className="font-bold text-slate-800">
                                                    <span>{point.name}</span>
                                                    <span className="block text-[8px] font-bold text-slate-400 uppercase mt-0.5">Porsi: {point.qty}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`inline-block text-[8px] font-black px-1.5 py-0.5 rounded-full ${point.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                                        {point.status === 'Delivered' ? `Tiba: ${point.delivered_at || '09:00'}` : 'Gagal/Pending'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </MainLayout>
    );
}
