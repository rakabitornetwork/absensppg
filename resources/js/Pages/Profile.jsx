import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import MainLayout from '../Layout/MainLayout';
import { Mail, Save, Trash2, Upload, User, UserCircle2, Lock } from 'lucide-react';

export default function Profile({ profile }) {
    const [avatarPreview, setAvatarPreview] = useState(profile.avatar_path || '');

    const { data, setData, post, processing, errors, reset } = useForm({
        name: profile.name || '',
        email: profile.email || '',
        password: '',
        password_confirmation: '',
        avatar: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        post('/profile', {
            forceFormData: true,
            onSuccess: () => {
                reset('password', 'password_confirmation', 'avatar');
            },
        });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        setData('avatar', file || null);

        if (file) {
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleDeleteAvatar = () => {
        if (!confirm('Hapus avatar admin saat ini?')) {
            return;
        }

        router.post('/profile/avatar/delete', {}, {
            onSuccess: () => {
                setAvatarPreview('');
                setData('avatar', null);
            },
        });
    };

    return (
        <MainLayout title="Profil Admin">
            <Head title="Profil Admin" />

            <div className="max-w-2xl mx-auto">
                <div className="mb-5">
                    <h2 className="text-sm font-extrabold text-slate-900 leading-none mb-1">Profil Admin</h2>
                    <p className="text-[10px] text-slate-500 font-medium">Ubah informasi akun, kredensial masuk, dan avatar administrator.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-slate-100 pb-5">
                        <div className="relative shrink-0">
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    className="w-20 h-20 rounded-2xl object-cover border border-blue-100 shadow-sm"
                                    alt={data.name || 'Avatar Admin'}
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                                    <UserCircle2 className="w-12 h-12 text-blue-300" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Upload className="w-3.5 h-3.5 text-slate-400" />
                                Avatar Admin
                            </label>
                            <input
                                type="file"
                                onChange={handleAvatarChange}
                                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
                                accept="image/*"
                            />
                            <p className="text-[9px] text-slate-400 mt-1">Format PNG/JPG/WebP/SVG, maksimal 2MB.</p>
                            {errors.avatar && <p className="text-[10px] text-rose-600 mt-1">{errors.avatar}</p>}

                            {profile.avatar_path && (
                                <button
                                    type="button"
                                    onClick={handleDeleteAvatar}
                                    className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:text-rose-700"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Hapus Avatar
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                Nama Admin
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-bold"
                                required
                            />
                            {errors.name && <p className="text-[10px] text-rose-600 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                Email Login
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-bold"
                                required
                            />
                            {errors.email && <p className="text-[10px] text-rose-600 mt-1">{errors.email}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Lock className="w-3.5 h-3.5 text-slate-400" />
                                Password Baru
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                                placeholder="Kosongkan jika tidak diganti"
                            />
                            {errors.password && <p className="text-[10px] text-rose-600 mt-1">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Lock className="w-3.5 h-3.5 text-slate-400" />
                                Konfirmasi Password
                            </label>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                                placeholder="Ulangi password baru"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-slate-50">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm hover:shadow flex items-center gap-1.5 transition-all active:translate-y-[1px] disabled:opacity-50"
                        >
                            <Save className="w-3.5 h-3.5" />
                            {processing ? 'Menyimpan...' : 'Simpan Profil'}
                        </button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}
