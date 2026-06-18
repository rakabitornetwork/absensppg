import React, { useState } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import MainLayout from '../../Layout/MainLayout';
import { 
    UserPlus, 
    Search, 
    Edit2, 
    Trash2, 
    X, 
    Key, 
    ShieldCheck, 
    UserCircle2,
    Mail,
    User,
    Lock
} from 'lucide-react';

export default function Index({ users = [] }) {
    const { props } = usePage();
    const currentUser = props.auth?.user || {};
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('All');
    
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);

    // Form setup using useForm
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'admin',
    });

    const openAddModal = () => {
        reset();
        setEditMode(false);
        setEditingUserId(null);
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setData({
            name: user.name,
            email: user.email,
            password: '', // blank by default for edit
            role: user.role,
        });
        setEditMode(true);
        setEditingUserId(user.id);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editMode) {
            post(`/users/${editingUserId}/update`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/users', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (user) => {
        if (user.id === currentUser.id) {
            alert('Anda tidak bisa menghapus akun Anda sendiri yang sedang digunakan.');
            return;
        }
        if (confirm(`Apakah Anda yakin ingin menghapus pengguna "${user.name}"?`)) {
            router.post(`/users/${user.id}/delete`);
        }
    };

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole = selectedRole === 'All' || user.role === selectedRole;
        return matchSearch && matchRole;
    });

    return (
        <MainLayout title="Manajemen Pengguna">
            <Head title="Manajemen Pengguna & Hak Akses (RBAC)" />

            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Upper control section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                        <h2 className="text-base font-extrabold text-slate-900 tracking-tight">MANAJEMEN PENGGUNA</h2>
                        <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5 tracking-wider">
                            Kelola pengguna sistem dan pembagian hak akses (RBAC)
                        </p>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-slate-950/10 active:translate-y-[1px]"
                    >
                        <UserPlus className="w-4 h-4" />
                        Tambah Pengguna
                    </button>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3">
                    <div className="flex-grow relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nama atau email pengguna..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-medium placeholder-slate-400 transition-all"
                        />
                    </div>
                    
                    <div className="flex gap-2">
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="text-xs p-2 border border-slate-200 rounded-xl bg-white font-bold text-slate-700 min-w-36 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                        >
                            <option value="All">Semua Hak Akses</option>
                            <option value="superadmin">Superadmin (IT)</option>
                            <option value="admin">Admin (Staff)</option>
                            <option value="distributor">Distributor</option>
                        </select>
                    </div>
                </div>

                {/* Users Table Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                                    <th className="py-3 px-4">Pengguna</th>
                                    <th className="py-3 px-4">Email</th>
                                    <th className="py-3 px-4 text-center">Hak Akses (Role)</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-12 text-center text-slate-400 font-bold">
                                            Tidak ditemukan pengguna yang cocok dengan kriteria pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 overflow-hidden shrink-0">
                                                        {user.avatar_path ? (
                                                            <img src={user.avatar_path} className="w-full h-full object-cover" alt="" />
                                                        ) : (
                                                            <UserCircle2 className="w-5 h-5" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="block font-bold text-slate-800">{user.name}</span>
                                                        {user.id === currentUser.id && (
                                                            <span className="inline-block text-[8px] font-bold bg-emerald-50 text-emerald-600 px-1 py-0.5 rounded border border-emerald-100 mt-0.5">
                                                                Anda Saat Ini
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 font-semibold text-slate-600 font-mono">
                                                {user.email}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                                                    user.role === 'superadmin' 
                                                        ? 'bg-rose-50 text-rose-700 border-rose-100' 
                                                        : user.role === 'admin' 
                                                        ? 'bg-sky-50 text-sky-700 border-sky-100'
                                                        : 'bg-purple-50 text-purple-700 border-purple-100'
                                                }`}>
                                                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                                                    {user.role === 'superadmin' && 'SUPERADMIN (IT)'}
                                                    {user.role === 'admin' && 'ADMIN (STAFF)'}
                                                    {user.role === 'distributor' && 'DISTRIBUTOR'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                                                    {user.role === 'superadmin' && currentUser.role !== 'superadmin' ? (
                                                        <span 
                                                            className="p-1.5 opacity-30 border border-slate-100 rounded-lg bg-slate-100 text-slate-400 cursor-not-allowed inline-block"
                                                            title="Hanya Superadmin yang dapat mengedit akun Superuser"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(user)}
                                                            className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 border border-amber-100 transition-colors"
                                                            title="Edit Pengguna"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                    
                                                    {user.role === 'superadmin' && currentUser.role !== 'superadmin' ? (
                                                        <span 
                                                            className="p-1.5 opacity-30 border border-slate-100 rounded-lg bg-slate-100 text-slate-400 cursor-not-allowed inline-block"
                                                            title="Hanya Superadmin yang dapat menghapus akun Superuser"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </span>
                                                    ) : user.id !== currentUser.id ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(user)}
                                                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 border border-rose-100 transition-colors"
                                                            title="Hapus Pengguna"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    ) : (
                                                        <span className="p-1.5 opacity-30 border border-slate-100 rounded-lg bg-slate-100 text-slate-400 cursor-not-allowed inline-block" title="Tidak dapat menghapus diri sendiri">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </span>
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
            </div>

            {/* CRUD User Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white w-full max-w-md rounded-2xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/75">
                            <div className="flex items-center gap-2">
                                <Key className="w-4 h-4 text-teal-600" />
                                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                                    {editMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                                </h3>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-1 rounded-lg hover:bg-slate-150 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
                            <div className="space-y-1">
                                <label className="block text-[9px] font-extrabold text-slate-400 uppercase">Nama Lengkap</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-bold"
                                        placeholder="Contoh: Raka Bitor"
                                        required
                                    />
                                </div>
                                {errors.name && <span className="text-[10px] text-rose-500 font-bold block mt-0.5">{errors.name}</span>}
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[9px] font-extrabold text-slate-400 uppercase">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-bold font-mono"
                                        placeholder="Contoh: raka@example.com"
                                        required
                                    />
                                </div>
                                {errors.email && <span className="text-[10px] text-rose-500 font-bold block mt-0.5">{errors.email}</span>}
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[9px] font-extrabold text-slate-400 uppercase">
                                    {editMode ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password'}
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-bold"
                                        placeholder={editMode ? 'Tulis password baru jika ingin diganti' : 'Minimal 6 karakter'}
                                        required={!editMode}
                                    />
                                </div>
                                {errors.password && <span className="text-[10px] text-rose-500 font-bold block mt-0.5">{errors.password}</span>}
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[9px] font-extrabold text-slate-400 uppercase">Hak Akses (Role)</label>
                                <select
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="w-full p-2 text-xs border border-slate-200 rounded-xl bg-white font-bold text-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                    required
                                >
                                    {currentUser.role === 'superadmin' && (
                                        <option value="superadmin">Superadmin (Tim IT - Izin Penuh)</option>
                                    )}
                                    <option value="admin">Admin (Staff Operasional)</option>
                                    <option value="distributor">Distributor (Kurir Logistik)</option>
                                </select>
                                {errors.role && <span className="text-[10px] text-rose-500 font-bold block mt-0.5">{errors.role}</span>}
                            </div>

                            <div className="pt-2 flex gap-2.5">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 rounded-xl transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-1/2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2 rounded-xl shadow-md transition-all active:translate-y-[1px] disabled:opacity-50"
                                >
                                    {editMode ? 'Simpan Perubahan' : 'Tambah User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
