import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import MainLayout from '../Layout/MainLayout';
import { 
    CookingPot, 
    Save, 
    Plus, 
    Trash2, 
    MapPin, 
    Utensils, 
    Calendar,
    Users,
    CheckCircle,
    Clock,
    AlertTriangle
} from 'lucide-react';

export default function DistributionTargets({ 
    settings = {}, 
    todayMenu = {}, 
    distributionPoints = [], 
    kitchenStaff = [], 
    dateFormatted 
}) {
    const { props } = usePage();
    const userRole = props.auth?.user?.role || 'admin';
    const { data, setData, post, processing, errors } = useForm({
        today_menu: todayMenu,
        distribution_points: distributionPoints,
        meal_target: settings.meal_target || 250
    });

    const mealTarget = parseInt(data.meal_target) || 0;

    const [totalAllocated, setTotalAllocated] = useState(0);

    // Dynamic Kitchen Rundown calculation based on settings.work_start_time
    const workStart = settings.work_start_time || '06:00';
    const [startH, startM] = workStart.split(':').map(Number);
    const getRelativeTime = (offsetHours, offsetMinutes = 0) => {
        const date = new Date();
        date.setHours(startH + offsetHours);
        date.setMinutes(startM + offsetMinutes);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const prepStart = getRelativeTime(-1);
    const prepEnd = getRelativeTime(0);
    const cookStart = getRelativeTime(0);
    const cookEnd = getRelativeTime(2);
    const nutritionStart = getRelativeTime(2);
    const nutritionEnd = getRelativeTime(2, 30);
    const deliveryStart = getRelativeTime(2, 30);
    const deliveryEnd = getRelativeTime(3, 30);

    // Calculate total allocated quantity (only when status is 'Delivered' / 'Tiba di Lokasi')
    useEffect(() => {
        const total = data.distribution_points
            .filter(item => item.status === 'Delivered')
            .reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0);
        setTotalAllocated(total);
    }, [data.distribution_points]);

    // Handle menu field changes
    const handleMenuChange = (field, value) => {
        setData('today_menu', {
            ...data.today_menu,
            [field]: value
        });
    };

    // Handle distribution point field changes
    const handlePointChange = (index, field, value) => {
        const updatedPoints = [...data.distribution_points];
        updatedPoints[index] = {
            ...updatedPoints[index],
            [field]: value
        };
        setData('distribution_points', updatedPoints);
    };

    // Add new distribution point
    const addDistributionPoint = () => {
        const nextId = data.distribution_points.length > 0 
            ? Math.max(...data.distribution_points.map(p => p.id)) + 1 
            : 1;
        
        setData('distribution_points', [
            ...data.distribution_points,
            { id: nextId, name: '', qty: 0, status: 'Pending' }
        ]);
    };

    // Remove distribution point
    const removeDistributionPoint = (index) => {
        const updatedPoints = data.distribution_points.filter((_, i) => i !== index);
        setData('distribution_points', updatedPoints);
    };

    // Submit form
    const handleSubmit = (e) => {
        e.preventDefault();
        post('/target-distribusi');
    };

    return (
        <MainLayout title="Target Distribusi Harian">
            <Head title="Target Distribusi Harian" />

            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                        <h2 className="text-sm font-extrabold text-slate-900 leading-none mb-1">Target & Rencana Kerja Distribusi</h2>
                        <p className="text-[10px] text-slate-500 font-medium">Kelola menu gizi, titik sekolah penerima, dan rundown dapur harian</p>
                    </div>
                    <div className="text-[10px] bg-teal-50 text-teal-800 border border-teal-100 rounded-md px-2.5 py-1 font-bold flex items-center gap-1.5 shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        Operasional: {dateFormatted}
                    </div>
                </div>

                {/* Target Metric Banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="block text-[9px] text-slate-400 font-bold uppercase">Target Porsi Harian</span>
                            <span className="text-xl font-black text-slate-800 tabular-nums">{mealTarget} <span className="text-xs font-semibold text-slate-500">Porsi</span></span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600">
                            <CookingPot className="w-5 h-5" />
                        </div>
                    </div>
                    
                    <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="block text-[9px] text-slate-400 font-bold uppercase">Total Terdistribusikan</span>
                            <span className="text-xl font-black text-slate-800 tabular-nums">{totalAllocated} <span className="text-xs font-semibold text-slate-500">Porsi</span></span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                            <MapPin className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="block text-[9px] text-slate-400 font-bold uppercase">Status Alokasi Porsi</span>
                            {totalAllocated === mealTarget ? (
                                <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1 mt-1">
                                    <CheckCircle className="w-3.5 h-3.5" /> Sesuai Target (100%)
                                </span>
                            ) : totalAllocated < mealTarget ? (
                                <span className="text-xs font-extrabold text-amber-600 flex items-center gap-1 mt-1">
                                    <AlertTriangle className="w-3.5 h-3.5" /> Kurang {mealTarget - totalAllocated} Porsi
                                </span>
                            ) : (
                                <span className="text-xs font-extrabold text-rose-600 flex items-center gap-1 mt-1">
                                    <AlertTriangle className="w-3.5 h-3.5" /> Kelebihan {totalAllocated - mealTarget} Porsi
                                </span>
                            )}
                        </div>
                        <div className={`p-2.5 rounded-xl ${totalAllocated === mealTarget ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            <Utensils className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main content column (Menu & Schools) */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Today's Menu */}
                        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
                            <div className="border-b border-slate-50 pb-2 flex items-center gap-2">
                                <Utensils className="w-4 h-4 text-teal-600" />
                                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Menu Makan Bergizi Harian</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1 sm:col-span-2 border-b border-slate-100 pb-3 mb-1">
                                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <CookingPot className="w-3.5 h-3.5 text-teal-600" />
                                        Target Makan Gratis (Porsi/Hari)
                                    </label>
                                    <input 
                                        type="number" 
                                        value={data.meal_target} 
                                        onChange={(e) => setData('meal_target', e.target.value)}
                                        className="w-full sm:w-1/3 text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 tabular-nums font-bold" 
                                        min="0"
                                        required
                                        disabled={userRole === 'distributor'}
                                    />
                                    {errors.meal_target && <p className="text-[10px] text-rose-600 mt-1">{errors.meal_target}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-bold text-slate-700 uppercase">Karbohidrat Utama</label>
                                    <input 
                                        type="text" 
                                        value={data.today_menu.carbohydrate || ''} 
                                        onChange={(e) => handleMenuChange('carbohydrate', e.target.value)}
                                        className="w-full text-xs p-2 border border-slate-200 rounded-lg font-bold" 
                                        placeholder="Contoh: Nasi Putih Organik / Kentang"
                                        required
                                        disabled={userRole === 'distributor'}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-bold text-slate-700 uppercase">Lauk Protein Hewani</label>
                                    <input 
                                        type="text" 
                                        value={data.today_menu.protein_hewan || ''} 
                                        onChange={(e) => handleMenuChange('protein_hewan', e.target.value)}
                                        className="w-full text-xs p-2 border border-slate-200 rounded-lg font-bold" 
                                        placeholder="Contoh: Ayam Goreng Lengkuas"
                                        required
                                        disabled={userRole === 'distributor'}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-bold text-slate-700 uppercase">Lauk Protein Nabati</label>
                                    <input 
                                        type="text" 
                                        value={data.today_menu.protein_nabati || ''} 
                                        onChange={(e) => handleMenuChange('protein_nabati', e.target.value)}
                                        className="w-full text-xs p-2 border border-slate-200 rounded-lg font-bold" 
                                        placeholder="Contoh: Tempe Mendoan / Tahu Semur"
                                        required
                                        disabled={userRole === 'distributor'}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-bold text-slate-700 uppercase">Sayuran (Vitamin & Serat)</label>
                                    <input 
                                        type="text" 
                                        value={data.today_menu.vegetable || ''} 
                                        onChange={(e) => handleMenuChange('vegetable', e.target.value)}
                                        className="w-full text-xs p-2 border border-slate-200 rounded-lg font-bold" 
                                        placeholder="Contoh: Sayur Sop Wortel Bakso"
                                        required
                                        disabled={userRole === 'distributor'}
                                    />
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-700 uppercase">Minuman & Pencuci Mulut</label>
                                    <input 
                                        type="text" 
                                        value={data.today_menu.beverage || ''} 
                                        onChange={(e) => handleMenuChange('beverage', e.target.value)}
                                        className="w-full text-xs p-2 border border-slate-200 rounded-lg font-bold" 
                                        placeholder="Contoh: Susu Kotak UHT & Buah Jeruk Manis"
                                        required
                                        disabled={userRole === 'distributor'}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Distribution Recipients */}
                        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
                            <div className="border-b border-slate-50 pb-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-teal-600" />
                                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Titik Penerima & Alokasi Porsi</h3>
                                </div>
                                {userRole !== 'distributor' && (
                                    <button
                                        type="button"
                                        onClick={addDistributionPoint}
                                        className="bg-teal-50 hover:bg-teal-100 text-teal-700 text-[10px] font-bold px-2 py-1 rounded-md border border-teal-200 flex items-center gap-1 transition-all"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Tambah Titik
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2.5">
                                {data.distribution_points.length === 0 ? (
                                    <p className="text-xs font-semibold text-slate-400 text-center py-4">Belum ada titik penerima. Klik tombol Tambah Titik.</p>
                                ) : (
                                    data.distribution_points.map((point, index) => (
                                        <div key={point.id} className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50/60 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                                            <div className="flex-1 w-full space-y-0.5">
                                                <label className="block text-[8px] font-extrabold text-slate-400 uppercase">Nama Sekolah / Lokasi</label>
                                                <input
                                                    type="text"
                                                    value={point.name}
                                                    onChange={(e) => handlePointChange(index, 'name', e.target.value)}
                                                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg font-bold font-sans"
                                                    placeholder="Contoh: SDN 01 Sukajadi"
                                                    required
                                                    disabled={userRole === 'distributor'}
                                                />
                                            </div>
                                            <div className="w-full sm:w-28 space-y-0.5">
                                                <label className="block text-[8px] font-extrabold text-slate-400 uppercase">Jumlah (Porsi)</label>
                                                <input
                                                    type="number"
                                                    value={point.qty}
                                                    onChange={(e) => handlePointChange(index, 'qty', parseInt(e.target.value) || 0)}
                                                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg font-bold tabular-nums"
                                                    min="0"
                                                    required
                                                    disabled={userRole === 'distributor'}
                                                />
                                            </div>
                                            <div className="w-full sm:w-36 space-y-0.5">
                                                <label className="block text-[8px] font-extrabold text-slate-400 uppercase">Status Pengiriman</label>
                                                <select
                                                    value={point.status}
                                                    onChange={(e) => handlePointChange(index, 'status', e.target.value)}
                                                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg font-bold text-slate-700 bg-white"
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="In Progress">Dalam Pengiriman</option>
                                                    <option value="Delivered">Tiba di Lokasi</option>
                                                </select>
                                            </div>
                                            {userRole !== 'distributor' && (
                                                <div className="flex flex-col justify-end h-full self-stretch sm:pt-3.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeDistributionPoint(index)}
                                                        className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors border border-rose-100 h-[30px] flex items-center justify-center"
                                                        title="Hapus lokasi"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm hover:shadow flex items-center gap-1.5 transition-all disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Menyimpan...' : 'Simpan Semua Data'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar column (Staff presence & Kitchen schedule) */}
                    <div className="space-y-6">
                        
                        {/* Kitchen Staff Presence */}
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                            <div className="border-b border-slate-50 pb-2 mb-3 flex items-center gap-2">
                                <Users className="w-4 h-4 text-teal-600" />
                                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Kehadiran Petugas Dapur</h3>
                            </div>
                            
                            <div className="space-y-3">
                                {kitchenStaff.length === 0 ? (
                                    <p className="text-[10px] text-slate-500 text-center font-medium">Tidak ada staf dengan peran dapur hari ini.</p>
                                ) : (
                                    kitchenStaff.map((staff) => (
                                        <div key={staff.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                                            <div>
                                                <span className="block text-[11px] font-extrabold text-slate-800 leading-none mb-0.5">{staff.name}</span>
                                                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">{staff.role} ({staff.nip})</span>
                                            </div>
                                            <div className="text-right">
                                                {staff.present ? (
                                                    <span className="inline-block text-[8px] font-black px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                        Masuk: {staff.clock_in}
                                                    </span>
                                                ) : (
                                                    <span className="inline-block text-[8px] font-black px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                                                        Mangkir
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Kitchen Workflow / Timeline */}
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                            <div className="border-b border-slate-50 pb-2 mb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-teal-600" />
                                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Jadwal & Rundown Dapur</h3>
                            </div>

                            <div className="relative border-l border-teal-100 pl-4 ml-2.5 space-y-4">
                                <div className="relative">
                                    <span className="absolute -left-[22px] top-0.5 bg-teal-500 rounded-full w-3 h-3 ring-4 ring-white" />
                                    <div>
                                        <span className="inline-block text-[9px] font-bold text-teal-600 tabular-nums">{prepStart} - {prepEnd} WIB</span>
                                        <h4 className="text-[11px] font-extrabold text-slate-800">Persiapan Dapur</h4>
                                        <p className="text-[9px] text-slate-500 leading-tight">Sanitasi ruang dapur, pencucian bahan baku sayur, pemotongan daging ayam.</p>
                                    </div>
                                </div>

                                <div className="relative">
                                    <span className="absolute -left-[22px] top-0.5 bg-sky-500 rounded-full w-3 h-3 ring-4 ring-white" />
                                    <div>
                                        <span className="inline-block text-[9px] font-bold text-sky-600 tabular-nums">{cookStart} - {cookEnd} WIB</span>
                                        <h4 className="text-[11px] font-extrabold text-slate-800">Proses Pengolahan Dapur</h4>
                                        <p className="text-[9px] text-slate-500 leading-tight">Memasak karbohidrat, penumisan sayur, penggorengan lauk utama.</p>
                                    </div>
                                </div>

                                <div className="relative">
                                    <span className="absolute -left-[22px] top-0.5 bg-amber-500 rounded-full w-3 h-3 ring-4 ring-white" />
                                    <div>
                                        <span className="inline-block text-[9px] font-bold text-amber-600 tabular-nums">{nutritionStart} - {nutritionEnd} WIB</span>
                                        <h4 className="text-[11px] font-extrabold text-slate-800">Pengawasan Nilai Gizi</h4>
                                        <p className="text-[9px] text-slate-500 leading-tight">Inspeksi higienitas & kalori porsi makanan oleh Tenaga Gizi (Dietitian).</p>
                                    </div>
                                </div>

                                <div className="relative">
                                    <span className="absolute -left-[22px] top-0.5 bg-indigo-500 rounded-full w-3 h-3 ring-4 ring-white" />
                                    <div>
                                        <span className="inline-block text-[9px] font-bold text-indigo-600 tabular-nums">{deliveryStart} - {deliveryEnd} WIB</span>
                                        <h4 className="text-[11px] font-extrabold text-slate-800">Penyajian & Pengiriman</h4>
                                        <p className="text-[9px] text-slate-500 leading-tight">Pengepakan dalam kemasan boks higienis dan pendistribusian ke sekolah mitra.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </form>

            </div>
        </MainLayout>
    );
}
