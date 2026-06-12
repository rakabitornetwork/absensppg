import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import MainLayout from '../Layout/MainLayout';
import { Save, HelpCircle, Building, Clock, DollarSign, CookingPot, Upload } from 'lucide-react';

export default function Settings({ settings = {} }) {
    
    const { data, setData, post, processing, errors } = useForm({
        office_name: settings.office_name || 'SPPG Sukajadi Mandiri',
        work_start_time: settings.work_start_time || '06:00',
        late_grace_time: settings.late_grace_time || '06:30',
        late_penalty_per_minute: settings.late_penalty_per_minute || 1000,
        meal_target: settings.meal_target || 250,
        app_logo: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/settings');
    };

    return (
        <MainLayout title="Pengaturan SPPG">
            <Head title="Pengaturan Sistem" />

            <div className="max-w-xl mx-auto">
                <div className="mb-4">
                    <h2 className="text-sm font-extrabold text-slate-900 leading-none mb-1">Pengaturan Operasional SPPG</h2>
                    <p className="text-[10px] text-slate-500 font-medium">Ubah shift kerja, denda keterlambatan, dan target Makan Bergizi Gratis</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
                    
                    {/* Unit Designation */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            Nama Satuan Pelayanan (SPPG)
                        </label>
                        <input
                            type="text"
                            value={data.office_name}
                            onChange={(e) => setData('office_name', e.target.value)}
                            className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-bold"
                            placeholder="Contoh: SPPG Sukajadi Mandiri"
                            required
                        />
                        {errors.office_name && <p className="text-[10px] text-rose-600 mt-1">{errors.office_name}</p>}
                    </div>

                    {/* Logo Upload */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Upload className="w-3.5 h-3.5 text-slate-400" />
                            Logo Aplikasi (PNG/JPG, maks 2MB)
                        </label>
                        <div className="flex items-center gap-3">
                            {settings.app_logo && (
                                <img src={settings.app_logo} className="w-10 h-10 rounded-lg object-cover border border-slate-100 shadow-xs" alt="Logo" />
                            )}
                            <input
                                type="file"
                                onChange={(e) => setData('app_logo', e.target.files[0])}
                                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 file:cursor-pointer"
                                accept="image/*"
                            />
                        </div>
                        {errors.app_logo && <p className="text-[10px] text-rose-600 mt-1">{errors.app_logo}</p>}
                    </div>

                    {/* Shifts grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                Jam Masuk Kerja
                            </label>
                            <input
                                type="text"
                                value={data.work_start_time}
                                onChange={(e) => setData('work_start_time', e.target.value)}
                                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 tabular-nums font-bold"
                                placeholder="HH:MM"
                                required
                            />
                            {errors.work_start_time && <p className="text-[10px] text-rose-600 mt-1">{errors.work_start_time}</p>}
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                Batas Toleransi (Grace Time)
                            </label>
                            <input
                                type="text"
                                value={data.late_grace_time}
                                onChange={(e) => setData('late_grace_time', e.target.value)}
                                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 tabular-nums font-bold"
                                placeholder="HH:MM"
                                required
                            />
                            {errors.late_grace_time && <p className="text-[10px] text-rose-600 mt-1">{errors.late_grace_time}</p>}
                            <p className="text-[9px] text-slate-400 mt-1">Check-in setelah waktu ini akan ditandai terlambat.</p>
                        </div>
                    </div>

                    {/* Financial penalty and target */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                                Denda Terlambat (per Menit)
                            </label>
                            <input
                                type="number"
                                value={data.late_penalty_per_minute}
                                onChange={(e) => setData('late_penalty_per_minute', parseInt(e.target.value) || 0)}
                                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 tabular-nums font-bold"
                                min="0"
                                required
                            />
                            {errors.late_penalty_per_minute && <p className="text-[10px] text-rose-600 mt-1">{errors.late_penalty_per_minute}</p>}
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <CookingPot className="w-3.5 h-3.5 text-slate-400" />
                                Target Makan Gratis (Porsi/Hari)
                            </label>
                            <input
                                type="number"
                                value={data.meal_target}
                                onChange={(e) => setData('meal_target', parseInt(e.target.value) || 0)}
                                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 tabular-nums font-bold"
                                min="0"
                                required
                            />
                            {errors.meal_target && <p className="text-[10px] text-rose-600 mt-1">{errors.meal_target}</p>}
                        </div>
                    </div>

                    {/* Instructions panel */}
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-[10px] text-slate-500 leading-normal flex items-start gap-2">
                        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                            <strong>Informasi Peraturan SPPG:</strong>
                            <p className="mt-0.5">Denda keterlambatan akan diakumulasikan setiap bulan berdasarkan hasil deteksi scanner kartu presensi karyawan. Pastikan format jam diisi dengan format 24 jam (contoh: 06:00 atau 06:30).</p>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-2 border-t border-slate-50">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm hover:shadow flex items-center gap-1.5 transition-all active:translate-y-[1px] disabled:opacity-50"
                        >
                            <Save className="w-3.5 h-3.5" />
                            {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                        </button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}
