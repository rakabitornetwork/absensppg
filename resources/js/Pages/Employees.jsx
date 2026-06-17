import React, { useState } from 'react';
import { Head, useForm, Link, usePage, router } from '@inertiajs/react';
import MainLayout from '../Layout/MainLayout';
import { QRCodeSVG } from 'qrcode.react';
import { 
    Plus, 
    Search, 
    Edit2, 
    Trash2, 
    Printer, 
    QrCode, 
    X, 
    Eye, 
    HelpCircle,
    UserCircle2
} from 'lucide-react';

export default function Employees({ employees = [], shifts = [] }) {
    const { props } = usePage();
    const officeName = props.officeName || 'SPPG Sukajadi Mandiri';
    const appLogo = props.appLogo || '';
    const officeAddress = props.officeAddress || '';
    const officeWhatsapp = props.officeWhatsapp || '';
    const officeEmail = props.officeEmail || '';
    const officeNotes = props.officeNotes || 'BERLAKU SELAMA KEGIATAN SPPG 2026';
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('All');
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [cardPreview, setCardPreview] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isCustomRole, setIsCustomRole] = useState(false);

    const rolesList = [
        'Kepala Satuan',
        'Tenaga Gizi',
        'Juru Masak',
        'Asisten Masak',
        'Pengantar/Kurir',
        'Administrasi'
    ];

    // Dynamically extract unique roles that are not in the default rolesList
    const uniqueCustomRoles = employees
        ? employees
              .map(emp => emp.role)
              .filter(role => role && !rolesList.includes(role))
              .filter((value, index, self) => self.indexOf(value) === index)
        : [];

    const allRoles = [...rolesList, ...uniqueCustomRoles];

    const getRolePrefix = (role) => {
        if (!role) return 'EMP';
        const parts = role.split(/[\s/]+/);
        if (parts.length > 1) {
            return parts.map(p => p.charAt(0).toUpperCase()).join('');
        }
        return role.substring(0, 3).toUpperCase();
    };

    const suggestNip = (role) => {
        const prefix = `SPPG-${getRolePrefix(role)}`;
        // Find all employees with NIP starting with this prefix
        const matchingEmployees = employees.filter(emp => emp.nip && emp.nip.startsWith(prefix));
        let maxNum = 0;
        matchingEmployees.forEach(emp => {
            const parts = emp.nip.split('-');
            const lastPart = parts[parts.length - 1];
            const num = parseInt(lastPart, 10);
            if (!isNaN(num) && num > maxNum) {
                maxNum = num;
            }
        });
        const nextNum = maxNum + 1;
        return `${prefix}-${String(nextNum).padStart(3, '0')}`;
    };

    const cleanNumber = (val) => {
        const clean = val.replace(/[^0-9]/g, '');
        return clean ? parseInt(clean, 10) : 0;
    };

    const formatInputNumber = (val) => {
        if (val === 0 || !val) return '';
        return new Intl.NumberFormat('id-ID').format(val);
    };

    const { data, setData, post, reset, errors } = useForm({
        nip: '',
        name: '',
        role: 'Juru Masak',
        email: '',
        phone: '',
        base_salary: 0,
        daily_allowance: 0,
        status: 'Active',
        photo: null,
        photo_path: '',
        photo_preview: null,
        shift_id: '',
    });

    const formatRupiah = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const handleAddClick = () => {
        setEditMode(false);
        setIsCustomRole(false);
        setShowForm(true);
        const defaultRole = 'Juru Masak';
        setData({
            nip: suggestNip(defaultRole),
            name: '',
            role: defaultRole,
            email: '',
            phone: '',
            base_salary: 0,
            daily_allowance: 0,
            status: 'Active',
            photo: null,
            photo_path: '',
            photo_preview: null,
            shift_id: shifts.length > 0 ? shifts[0].id : '',
        });
    };

    const handleEditClick = (emp) => {
        const isCustom = !rolesList.includes(emp.role);
        setIsCustomRole(isCustom);

        setData({
            nip: emp.nip,
            name: emp.name,
            role: emp.role,
            email: emp.email || '',
            phone: emp.phone || '',
            base_salary: emp.base_salary,
            daily_allowance: emp.daily_allowance,
            status: emp.status,
            photo: null,
            photo_path: emp.photo_path || '',
            photo_preview: null,
            shift_id: emp.shift_id || '',
        });
        setEditingId(emp.id);
        setEditMode(true);
        setShowForm(true);
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus data karyawan ini?')) {
            post(`/employees/${id}/delete`, {
                onSuccess: () => {
                    setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
                }
            });
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const newIds = [...selectedIds];
            filteredEmployees.forEach(emp => {
                if (!newIds.includes(emp.id)) {
                    newIds.push(emp.id);
                }
            });
            setSelectedIds(newIds);
        } else {
            const filteredIds = filteredEmployees.map(emp => emp.id);
            setSelectedIds(selectedIds.filter(id => !filteredIds.includes(id)));
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(item => item !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkDelete = () => {
        if (confirm(`Apakah Anda yakin ingin menghapus secara massal ${selectedIds.length} karyawan terpilih? Tindakan ini tidak dapat dibatalkan.`)) {
            router.post('/employees/bulk-delete', { ids: selectedIds }, {
                onSuccess: () => {
                    setSelectedIds([]);
                }
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editMode) {
            post(`/employees/${editingId}/update`, {
                onSuccess: () => {
                    setShowForm(false);
                    reset();
                }
            });
        } else {
            post('/employees', {
                onSuccess: () => {
                    setShowForm(false);
                    reset();
                }
            });
        }
    };

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = 
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            emp.nip.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === 'All' || emp.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    return (
        <MainLayout title="Data Karyawan">
            <Head title="Kelola Karyawan" />
            <style>{`
                @media print {
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

            {/* Title / Action bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-3 mb-5 sm:mb-4">
                <div className="space-y-1">
                    <h2 className="text-sm font-extrabold text-slate-900 leading-none mb-1">Daftar Karyawan SPPG</h2>
                    <p className="text-[10px] text-slate-500 font-medium">Manajemen staff operasional pemenuhan gizi MBG</p>
                </div>
                <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
                    <Link
                        href="/employees/print-cards"
                        className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-3 py-2 sm:py-1.5 rounded-lg shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 active:translate-y-[1px]"
                    >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        Cetak Kartu Karyawan
                    </Link>
                    <button
                        onClick={handleAddClick}
                        className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-2 sm:py-1.5 rounded-lg shadow shadow-teal-500/10 hover:shadow-teal-500/20 transition-all flex items-center justify-center gap-1 active:translate-y-[1px]"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah Karyawan
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white border border-slate-100 rounded-xl p-3 sm:p-3.5 shadow-sm mb-5 sm:mb-4 flex flex-col md:flex-row gap-3 sm:gap-3.5">
                <div className="flex-1 relative min-w-0">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
                        <Search className="w-4 h-4" />
                    </span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full text-xs pl-8 pr-3 py-2 sm:py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50"
                        placeholder="Cari berdasarkan nama atau NIP..."
                    />
                </div>
                <div className="flex flex-col min-[420px]:flex-row min-[420px]:items-center gap-1.5 min-[420px]:gap-2 md:w-auto">
                    <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">Filter Posisi:</span>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full min-[420px]:w-auto text-xs border border-slate-200 rounded-lg p-2 sm:p-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                    >
                        <option value="All">Semua Posisi</option>
                        {rolesList.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main Area (Table + Optional Form Side-by-Side) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-5 items-start">
                
                {/* Table (Takes 8 cols if form is open, 12 if closed) */}
                <div className={`bg-white border border-slate-100 rounded-xl p-3 sm:p-4 shadow-sm ${showForm ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
                    <div className="overflow-x-auto pb-1 -mx-1 px-1">
                        <table className="w-full min-w-[920px] text-left text-xs table-fixed">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase">
                                    <th className="w-[44px] py-2.5 pl-3 pr-2">
                                        <input
                                            type="checkbox"
                                            checked={filteredEmployees.length > 0 && filteredEmployees.every(emp => selectedIds.includes(emp.id))}
                                            onChange={handleSelectAll}
                                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500/20 w-3.5 h-3.5 cursor-pointer"
                                        />
                                    </th>
                                    <th className="w-[180px] py-2.5 px-3">Karyawan (NIP)</th>
                                    <th className="w-[170px] py-2.5 px-3">Posisi / Kontak</th>
                                    <th className="w-[145px] py-2.5 px-3">Shift Kerja</th>
                                    <th className="w-[125px] py-2.5 px-3 text-right">Gaji Pokok</th>
                                    <th className="w-[125px] py-2.5 px-3 text-right">Uang Harian</th>
                                    <th className="w-[78px] py-2.5 px-3 text-center">Status</th>
                                    <th className="w-[110px] py-2.5 pl-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-8 text-slate-400 font-semibold">
                                            Karyawan tidak ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEmployees.map((emp) => (
                                        <tr key={emp.id} className={`hover:bg-slate-50/30 transition-colors ${selectedIds.includes(emp.id) ? 'bg-teal-50/20' : ''}`}>
                                            <td className="py-3 pl-3 pr-2 align-middle">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(emp.id)}
                                                    onChange={() => handleSelectOne(emp.id)}
                                                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500/20 w-3.5 h-3.5 cursor-pointer"
                                                />
                                            </td>
                                            <td className="py-3 px-3 font-bold text-slate-900 align-middle">
                                                {emp.name}
                                                <span className="block text-[10px] text-slate-400 font-medium tabular-nums">{emp.nip}</span>
                                            </td>
                                            <td className="py-3 px-3 align-middle">
                                                <span className="font-bold text-slate-700">{emp.role}</span>
                                                <span className="block text-[10px] text-slate-400 truncate max-w-[160px] font-medium">{emp.phone || '-'}</span>
                                            </td>
                                            <td className="py-3 px-3 text-slate-700 align-middle">
                                                {emp.shift ? (
                                                    <div>
                                                        <span className="font-bold block">{emp.shift.name}</span>
                                                        <span className="text-[10px] text-slate-400 font-semibold tabular-nums">{emp.shift.start_time} - {emp.shift.end_time}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 font-medium text-[10px]">Default Unit</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-3 text-right font-extrabold text-slate-800 tabular-nums align-middle whitespace-nowrap">
                                                {formatRupiah(emp.base_salary)}
                                            </td>
                                            <td className="py-3 px-3 text-right font-extrabold text-slate-800 tabular-nums align-middle whitespace-nowrap">
                                                {formatRupiah(emp.daily_allowance)}
                                            </td>
                                            <td className="py-3 px-3 text-center align-middle">
                                                <span className={`inline-block w-2 h-2 rounded-full ${emp.status === 'Active' ? 'bg-teal-500' : 'bg-slate-300'}`} title={emp.status} />
                                            </td>
                                            <td className="py-3 pl-3 text-right align-middle">
                                                <div className="flex justify-end gap-1.5">
                                                    <button
                                                        onClick={() => setCardPreview(emp)}
                                                        className="p-1 rounded bg-slate-50 text-slate-500 hover:text-teal-600 hover:bg-teal-50 border border-slate-100 transition-colors"
                                                        title="Lihat ID Card"
                                                    >
                                                        <QrCode className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditClick(emp)}
                                                        className="p-1 rounded bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-100 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(emp.id)}
                                                        className="p-1 rounded bg-slate-50 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-100 transition-colors"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
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

                {/* Form Drawer (Takes 4 cols if open) */}
                {showForm && (
                    <div className="lg:col-span-4 bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-4 animate-in slide-in-from-right-4 duration-200">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                                {editMode ? 'Edit Karyawan' : 'Tambah Karyawan'}
                            </h3>
                            <button
                                onClick={() => setShowForm(false)}
                                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-50"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-1">NIP (Nomor Induk Pegawai)</label>
                                <input
                                    type="text"
                                    value={data.nip}
                                    onChange={(e) => setData('nip', e.target.value)}
                                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-mono"
                                    placeholder="SPPG-MBG-XXX"
                                    required
                                />
                                {errors.nip && <p className="text-[10px] text-rose-600 mt-0.5">{errors.nip}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                                    placeholder="Contoh: Budi Santoso"
                                    required
                                />
                                {errors.name && <p className="text-[10px] text-rose-600 mt-0.5">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-1">Foto Karyawan (Opsional)</label>
                                <div className="flex items-center gap-2">
                                    {data.photo_preview || data.photo_path ? (
                                        <img
                                            src={data.photo_preview || data.photo_path}
                                            className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                                            alt="Preview"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                                            <UserCircle2 className="w-8 h-8 text-slate-300" />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            setData('photo', file);
                                            if (file) {
                                                setData('photo_preview', URL.createObjectURL(file));
                                            }
                                        }}
                                        className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 file:cursor-pointer"
                                        accept="image/*"
                                    />
                                </div>
                                {errors.photo && <p className="text-[10px] text-rose-600 mt-0.5">{errors.photo}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-1">Posisi / Jabatan</label>
                                <select
                                    value={isCustomRole ? 'custom' : data.role}
                                    onChange={(e) => {
                                        if (e.target.value === 'custom') {
                                            setIsCustomRole(true);
                                            setData('role', '');
                                        } else {
                                            setIsCustomRole(false);
                                            setData(prev => ({
                                                ...prev,
                                                role: e.target.value,
                                                nip: editMode ? prev.nip : suggestNip(e.target.value)
                                            }));
                                        }
                                    }}
                                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 bg-white"
                                >
                                    {allRoles.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                    <option value="custom">+ Tambah Posisi Baru...</option>
                                </select>

                                {isCustomRole && (
                                    <div className="mt-2 p-2 bg-slate-50 border border-slate-100 rounded-lg animate-in slide-in-from-top-1 duration-200">
                                        <label className="block text-[9px] font-bold text-teal-700 mb-1 uppercase">Input Posisi / Jabatan Baru</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={data.role}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setData(prev => ({
                                                        ...prev,
                                                        role: val,
                                                        nip: editMode ? prev.nip : suggestNip(val)
                                                    }));
                                                }}
                                                className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 bg-white"
                                                placeholder="Contoh: Staff Kebersihan"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsCustomRole(false);
                                                    setData(prev => ({
                                                        ...prev,
                                                        role: rolesList[0],
                                                        nip: editMode ? prev.nip : suggestNip(rolesList[0])
                                                    }));
                                                }}
                                                className="text-[10px] font-bold text-slate-500 hover:text-slate-700 px-2.5 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 bg-white cursor-pointer transition-colors"
                                            >
                                                Batal
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-1">Email (Opsional)</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                                    placeholder="alamat@sppg.com"
                                />
                                {errors.email && <p className="text-[10px] text-rose-600 mt-0.5">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-1">Nomor Telepon</label>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                                    placeholder="08xxxxxxxxxx"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Gaji Pokok (Bulan)</label>
                                    <input
                                        type="text"
                                        value={formatInputNumber(data.base_salary)}
                                        onChange={(e) => setData('base_salary', cleanNumber(e.target.value))}
                                        className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 tabular-nums"
                                        placeholder="Contoh: 5.000.000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Uang Harian (Transport/Makan)</label>
                                    <input
                                        type="text"
                                        value={formatInputNumber(data.daily_allowance)}
                                        onChange={(e) => setData('daily_allowance', cleanNumber(e.target.value))}
                                        className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 tabular-nums"
                                        placeholder="Contoh: 50.000"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-1">Shift Kerja</label>
                                <select
                                    value={data.shift_id}
                                    onChange={(e) => setData('shift_id', e.target.value)}
                                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 bg-white"
                                >
                                    <option value="">-- Gunakan Setelan Default Unit --</option>
                                    {shifts.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} ({s.start_time} - {s.end_time})
                                        </option>
                                    ))}
                                </select>
                                {errors.shift_id && <p className="text-[10px] text-rose-600 mt-0.5">{errors.shift_id}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-1">Status Keaktifan</label>
                                <div className="flex gap-4 mt-1 text-xs font-semibold">
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={data.status === 'Active'}
                                            onChange={() => setData('status', 'Active')}
                                            className="text-teal-600 focus:ring-teal-500/20"
                                        />
                                        Aktif
                                    </label>
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={data.status === 'Inactive'}
                                            onChange={() => setData('status', 'Inactive')}
                                            className="text-slate-600 focus:ring-slate-500/20"
                                        />
                                        Nonaktif
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2 px-4 rounded-lg shadow shadow-teal-500/10 hover:shadow-teal-500/20 transition-all flex items-center justify-center gap-1 mt-3"
                            >
                                Simpan Perubahan
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* ID Card Single Preview Modal */}
            {cardPreview && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <style>{`
                        @media print {
                            body {
                                visibility: hidden;
                                margin: 0 !important;
                                padding: 0 !important;
                            }
                            #print-card-badge, #print-card-badge * {
                                visibility: visible;
                            }
                            #print-card-badge {
                                position: absolute;
                                left: 0;
                                top: 0;
                                margin: 0;
                                padding: 0;
                                box-shadow: none !important;
                                ring: none !important;
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                            @page {
                                size: auto;
                                margin: 0mm;
                            }
                        }
                    `}</style>
                    <div className="bg-white border border-slate-100 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-900 uppercase">Preview Kartu Karyawan</span>
                            <button
                                onClick={() => setCardPreview(null)}
                                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-50"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* ID Badge Body */}
                        <div className="p-6 bg-slate-50 flex flex-col items-center">
                            <div id="print-card-badge" className="h-[105mm] w-[74mm] relative overflow-hidden rounded-[22px] bg-slate-950 text-white shadow-2xl shadow-slate-900/25 ring-1 ring-slate-900/10">
                                {/* Premium background layers */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.48),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(14,165,233,0.28),transparent_26%),linear-gradient(145deg,#061A40_0%,#0B2F6B_54%,#075985_100%)]" />
                                <div className="absolute -top-14 -right-12 w-32 h-32 rounded-full border-[18px] border-white/5" />
                                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-700 via-sky-400 to-blue-200" />
                                <div className="absolute inset-x-3 bottom-3 h-28 rounded-[24px] bg-white/[0.06] blur-sm" />

                                <div className="relative z-10 h-full p-4 flex flex-col">
                                    {/* Brand Header */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-[5.5px] font-black tracking-[0.24em] uppercase text-sky-100/90">Official Staff Card</p>
                                            <h4 className="text-[9px] font-black leading-tight uppercase text-white mt-1 max-w-[150px]">{officeName}</h4>
                                            <p className="text-[6px] text-blue-100/85 font-bold uppercase tracking-[0.18em] mt-0.5">SPPG MBG</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-xl bg-transparent flex items-center justify-center shrink-0 overflow-hidden">
                                            {appLogo ? (
                                                <img src={appLogo} className="w-full h-full object-contain p-1" alt="Logo SPPG" />
                                            ) : (
                                                <span className="text-[10px] font-black tracking-tight text-blue-900">ID</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Employee Photo */}
                                    <div className="flex flex-col items-center mt-4">
                                        <div className="relative">
                                            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-blue-200 via-sky-200 to-white opacity-95" />
                                            <div className="relative w-[22mm] h-[22mm] rounded-full bg-slate-100 flex items-center justify-center border-[3px] border-slate-950 overflow-hidden shadow-xl">
                                                {cardPreview.photo_path ? (
                                                    <img src={cardPreview.photo_path} className="w-full h-full object-cover" alt={cardPreview.name} />
                                                ) : (
                                                    <UserCircle2 className="w-14 h-14 text-slate-300" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-center mt-3 w-full">
                                            <h5 className="text-[13px] font-black text-white leading-tight truncate px-1">{cardPreview.name}</h5>
                                            <span className="inline-flex max-w-full mt-1.5 px-2 py-0.5 rounded-full bg-blue-100 text-blue-950 border border-blue-200 text-[7px] font-black uppercase tracking-[0.12em] truncate">
                                                {cardPreview.role}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Detail Strip */}
                                    <div className="mt-3 rounded-2xl bg-white/[0.08] border border-white/10 p-2.5 space-y-1.5">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-[5.5px] font-black tracking-[0.18em] uppercase text-slate-300">NIP</span>
                                            <span className="text-[7px] font-black text-white tabular-nums truncate">{cardPreview.nip}</span>
                                        </div>
                                    </div>

                                    {/* QR Code SVG */}
                                    <div className="mt-3 flex flex-col items-center">
                                        <div className="bg-white p-2.5 rounded-2xl shadow-xl border border-white">
                                            <QRCodeSVG 
                                                value={cardPreview.qr_token} 
                                                size={92} 
                                                level="H"
                                            />
                                        </div>
                                        <p className="mt-1 mb-2 text-[5.8px] text-blue-50/90 font-black uppercase tracking-[0.2em]">Scan Presensi QR</p>
                                    </div>

                                    {/* Office Info */}
                                    {(officeAddress || officeWhatsapp || officeEmail) && (
                                        <div className="mt-2 text-[5.5px] text-slate-300/85 font-semibold text-center leading-tight space-y-0.5">
                                            {officeAddress && <p className="truncate" title={officeAddress}>{officeAddress}</p>}
                                            <div className="flex justify-center gap-1.5 flex-wrap">
                                                {officeWhatsapp && <span>WA: {officeWhatsapp}</span>}
                                                {officeEmail && <span className="truncate max-w-[86px]">Email: {officeEmail}</span>}
                                            </div>
                                        </div>
                                    )}

                                    {/* Footer info */}
                                    <div className="mt-2 text-center border-t border-white/10 pt-1.5">
                                        <span className="text-[5px] text-blue-100/85 font-black tracking-[0.2em] uppercase">{officeNotes}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Print Button inside Modal */}
                        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    window.print();
                                }}
                                className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                Cetak Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-teal-200/60 px-4 py-3 rounded-xl shadow-xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold border border-teal-100">
                            {selectedIds.length}
                        </span>
                        <span className="text-[11px] text-slate-600 font-bold">
                            Karyawan terpilih
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
