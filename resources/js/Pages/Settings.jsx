import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import MainLayout from '../Layout/MainLayout';
import { 
    Save, 
    HelpCircle, 
    Building, 
    Clock, 
    DollarSign, 
    CookingPot, 
    Upload, 
    MapPin, 
    Phone, 
    Mail, 
    Info,
    Plus,
    Edit2,
    Trash2,
    X
} from 'lucide-react';

export default function Settings({ settings = {}, shifts = [] }) {
    const [activeTab, setActiveTab] = useState('general'); // 'general' or 'shifts'
    const [showShiftForm, setShowShiftForm] = useState(false);
    const [shiftEditMode, setShiftEditMode] = useState(false);
    const [editingShiftId, setEditingShiftId] = useState(null);

    // General Settings Form
    const { data, setData, post, processing, errors } = useForm({
        office_name: settings.office_name || 'SPPG Sukajadi Mandiri',
        work_start_time: settings.work_start_time || '06:00',
        late_grace_time: settings.late_grace_time || '06:30',
        late_penalty_per_minute: settings.late_penalty_per_minute || 1000,
        meal_target: settings.meal_target || 250,
        app_logo: null,
        app_title: settings.app_title || 'SPPG MBG',
        app_subtitle: settings.app_subtitle || 'Nutrition Portal',
        office_address: settings.office_address || '',
        office_whatsapp: settings.office_whatsapp || '',
        office_email: settings.office_email || '',
        office_notes: settings.office_notes || '',
        office_leader: settings.office_leader || '',
    });

    // Shift Form
    const { 
        data: shiftData, 
        setData: setShiftData, 
        post: postShift, 
        reset: resetShift, 
        errors: shiftErrors, 
        processing: shiftProcessing 
    } = useForm({
        name: '',
        start_time: '',
        grace_time: '',
        end_time: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/settings');
    };

    const handleAddShift = () => {
        setShiftEditMode(false);
        setShiftData({
            name: '',
            start_time: '08:00',
            grace_time: '08:30',
            end_time: '16:00',
        });
        setShowShiftForm(true);
    };

    const handleEditShift = (shift) => {
        setShiftEditMode(true);
        setEditingShiftId(shift.id);
        setShiftData({
            name: shift.name,
            start_time: shift.start_time,
            grace_time: shift.grace_time,
            end_time: shift.end_time,
        });
        setShowShiftForm(true);
    };

    const handleShiftSubmit = (e) => {
        e.preventDefault();
        if (shiftEditMode) {
            postShift(`/settings/shifts/${editingShiftId}/update`, {
                onSuccess: () => {
                    setShowShiftForm(false);
                    resetShift();
                }
            });
        } else {
            postShift('/settings/shifts', {
                onSuccess: () => {
                    setShowShiftForm(false);
                    resetShift();
                }
            });
        }
    };

    const handleDeleteShift = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus shift ini? Karyawan yang dikaitkan ke shift ini akan otomatis kembali menggunakan jam default unit.')) {
            router.post(`/settings/shifts/${id}/delete`);
        }
    };

    return (
        <MainLayout title="Pengaturan SPPG">
            <Head title="Pengaturan Sistem" />

            <div className="max-w-xl mx-auto">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                        <h2 className="text-sm font-extrabold text-slate-900 leading-none mb-1">Pengaturan Operasional SPPG</h2>
                        <p className="text-[10px] text-slate-500 font-medium">Ubah operasional unit, kontak informasi, dan kustomisasi shift kerja</p>
                    </div>
                    
                    {/* Tab Navigation */}
                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0 self-start sm:self-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab('general')}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${activeTab === 'general' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            Setelan Umum
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('shifts')}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${activeTab === 'shifts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            Shift Kerja
                        </button>
                    </div>
                </div>

                {activeTab === 'general' ? (
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

                        {/* Office Leader */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Building className="w-3.5 h-3.5 text-slate-400" />
                                Kepala Satuan Pelayanan (Tanda Tangan Slip Gaji)
                            </label>
                            <input
                                type="text"
                                value={data.office_leader}
                                onChange={(e) => setData('office_leader', e.target.value)}
                                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-bold"
                                placeholder="Contoh: Budi Santoso, S.Sos"
                            />
                            {errors.office_leader && <p className="text-[10px] text-rose-600 mt-1">{errors.office_leader}</p>}
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

                        {/* App Title & Subtitle Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <Building className="w-3.5 h-3.5 text-slate-400" />
                                    Judul Aplikasi (Sidebar)
                                </label>
                                <input
                                    type="text"
                                    value={data.app_title}
                                    onChange={(e) => setData('app_title', e.target.value)}
                                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-bold"
                                    placeholder="Contoh: SPPG MBG"
                                    maxLength="50"
                                    required
                                />
                                {errors.app_title && <p className="text-[10px] text-rose-600 mt-1">{errors.app_title}</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <Building className="w-3.5 h-3.5 text-slate-400" />
                                    Sub-judul Aplikasi (Sidebar)
                                </label>
                                <input
                                    type="text"
                                    value={data.app_subtitle}
                                    onChange={(e) => setData('app_subtitle', e.target.value)}
                                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-bold"
                                    placeholder="Contoh: Nutrition Portal"
                                    maxLength="50"
                                    required
                                />
                                {errors.app_subtitle && <p className="text-[10px] text-rose-600 mt-1">{errors.app_subtitle}</p>}
                            </div>
                        </div>

                        {/* Default Shifts grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    Jam Masuk Kerja (Default)
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
                                    Batas Toleransi (Default)
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

                        {/* Contact Info Section */}
                        <div className="border-t border-slate-100 pt-4 space-y-4">
                            <h4 className="text-[10px] font-extrabold text-teal-700 uppercase tracking-wider">Kontak & Alamat SPPG</h4>
                            
                            <div>
                                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    Alamat Operasional SPPG
                                </label>
                                <textarea
                                    value={data.office_address}
                                    onChange={(e) => setData('office_address', e.target.value)}
                                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-medium"
                                    placeholder="Contoh: Jl. Sukajadi No. 123, Bandung"
                                    rows="2"
                                />
                                {errors.office_address && <p className="text-[10px] text-rose-600 mt-1">{errors.office_address}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                        Nomor WhatsApp (SPPG)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.office_whatsapp}
                                        onChange={(e) => setData('office_whatsapp', e.target.value)}
                                        className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-medium"
                                        placeholder="Contoh: 081234567890"
                                    />
                                    {errors.office_whatsapp && <p className="text-[10px] text-rose-600 mt-1">{errors.office_whatsapp}</p>}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                        Email SPPG
                                    </label>
                                    <input
                                        type="email"
                                        value={data.office_email}
                                        onChange={(e) => setData('office_email', e.target.value)}
                                        className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-medium"
                                        placeholder="Contoh: sppg@sppg.com"
                                    />
                                    {errors.office_email && <p className="text-[10px] text-rose-600 mt-1">{errors.office_email}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <Info className="w-3.5 h-3.5 text-slate-400" />
                                    Catatan / Info Penting Lainnya (Tampil di ID Card)
                                </label>
                                <input
                                    type="text"
                                    value={data.office_notes}
                                    onChange={(e) => setData('office_notes', e.target.value)}
                                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-medium"
                                    placeholder="Contoh: Beroperasi Sen-Jum 05:00 - 16:00 WIB"
                                />
                                {errors.office_notes && <p className="text-[10px] text-rose-600 mt-1">{errors.office_notes}</p>}
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
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">Daftar Shift Kerja Kustom</h3>
                            <button
                                type="button"
                                onClick={handleAddShift}
                                className="bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm hover:shadow flex items-center gap-1 transition-all active:translate-y-[1px]"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Tambah Shift
                            </button>
                        </div>

                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase">
                                            <th className="py-2">Nama Shift</th>
                                            <th className="py-2">Jam Masuk</th>
                                            <th className="py-2">Grace Time</th>
                                            <th className="py-2">Jam Pulang</th>
                                            <th className="py-2 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {shifts.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="text-center py-6 text-slate-400 font-semibold">
                                                    Belum ada shift kerja kustom.
                                                </td>
                                            </tr>
                                        ) : (
                                            shifts.map((s) => (
                                                <tr key={s.id} className="hover:bg-slate-50/30 transition-colors">
                                                    <td className="py-2.5 font-bold text-slate-800">{s.name}</td>
                                                    <td className="py-2.5 font-semibold text-slate-600 tabular-nums">{s.start_time}</td>
                                                    <td className="py-2.5 font-semibold text-slate-600 tabular-nums">{s.grace_time}</td>
                                                    <td className="py-2.5 font-semibold text-slate-600 tabular-nums">{s.end_time}</td>
                                                    <td className="py-2.5 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEditShift(s)}
                                                                className="p-1 rounded bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-100 transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit2 className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteShift(s.id)}
                                                                className="p-1 rounded bg-slate-50 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-100 transition-colors"
                                                                title="Hapus"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Shift Info Disclaimer */}
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-[10px] text-slate-500 leading-normal flex items-start gap-2">
                            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                                <strong>Catatan Shift Kerja:</strong>
                                <p className="mt-0.5">Karyawan yang terikat ke shift tertentu akan dihitung status keterlambatan dan jumlah jam kerjanya berdasarkan waktu shift masing-masing. Jika karyawan tidak diset shiftnya (Default Unit), mereka akan menggunakan "Jam Masuk Kerja" dan "Batas Toleransi" default di tab Setelan Umum.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Shift Create/Edit Modal */}
            {showShiftForm && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-100 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-900 uppercase">
                                {shiftEditMode ? 'Edit Shift Kerja' : 'Tambah Shift Kerja Baru'}
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowShiftForm(false)}
                                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-50"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleShiftSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Nama Shift</label>
                                <input
                                    type="text"
                                    value={shiftData.name}
                                    onChange={(e) => setShiftData('name', e.target.value)}
                                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-bold"
                                    placeholder="Contoh: Shift Siang, Shift Lembur"
                                    required
                                />
                                {shiftErrors.name && <p className="text-[10px] text-rose-600 mt-1">{shiftErrors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Jam Masuk</label>
                                    <input
                                        type="text"
                                        value={shiftData.start_time}
                                        onChange={(e) => setShiftData('start_time', e.target.value)}
                                        className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 tabular-nums font-bold"
                                        placeholder="08:00"
                                        required
                                    />
                                    {shiftErrors.start_time && <p className="text-[10px] text-rose-600 mt-1">{shiftErrors.start_time}</p>}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Grace Time</label>
                                    <input
                                        type="text"
                                        value={shiftData.grace_time}
                                        onChange={(e) => setShiftData('grace_time', e.target.value)}
                                        className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 tabular-nums font-bold"
                                        placeholder="08:30"
                                        required
                                    />
                                    {shiftErrors.grace_time && <p className="text-[10px] text-rose-600 mt-1">{shiftErrors.grace_time}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Jam Pulang</label>
                                <input
                                    type="text"
                                    value={shiftData.end_time}
                                    onChange={(e) => setShiftData('end_time', e.target.value)}
                                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 tabular-nums font-bold"
                                    placeholder="16:00"
                                    required
                                />
                                {shiftErrors.end_time && <p className="text-[10px] text-rose-600 mt-1">{shiftErrors.end_time}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={shiftProcessing}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-sm hover:shadow hover:shadow-teal-500/10 transition-all flex items-center justify-center gap-1 mt-2 disabled:opacity-50"
                            >
                                <Save className="w-3.5 h-3.5" />
                                {shiftProcessing ? 'Menyimpan...' : 'Simpan Shift'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
