import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import MainLayout from '../Layout/MainLayout';
import { AlertTriangle, Archive, Database as DatabaseIcon, Download, RotateCcw, Upload, Lock } from 'lucide-react';

export default function Database({ tableStats = [] }) {
    const { props } = usePage();
    const userRole = props.auth?.user?.role || 'admin';
    const [selectedFileName, setSelectedFileName] = useState('');
    const cardClass = 'h-full min-h-[300px] bg-white rounded-3xl p-5 shadow-sm flex flex-col';
    const iconClass = 'w-10 h-10 rounded-2xl flex items-center justify-center mb-4';
    const titleClass = 'text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2';
    const descriptionClass = 'text-[10px] text-slate-500 leading-relaxed';
    const actionButtonClass = 'inline-flex h-10 w-full items-center justify-center gap-1.5 text-white text-xs font-bold px-3 rounded-xl shadow-sm active:translate-y-[1px] transition-all disabled:opacity-50';

    const {
        data: restoreData,
        setData: setRestoreData,
        post: postRestore,
        processing: restoring,
        errors: restoreErrors,
        reset: resetRestore,
    } = useForm({
        backup_file: null,
        confirmation: '',
    });

    const {
        data: resetData,
        setData: setResetData,
        post: postReset,
        processing: resetting,
        errors: resetErrors,
        reset: resetResetForm,
    } = useForm({
        confirmation: '',
    });

    const handleRestoreSubmit = (e) => {
        e.preventDefault();

        if (!confirm('Restore akan mengganti data aplikasi dengan isi file backup. Lanjutkan?')) {
            return;
        }

        postRestore('/pemeliharaan-data/restore', {
            forceFormData: true,
            onSuccess: () => {
                resetRestore();
                setSelectedFileName('');
            },
        });
    };

    const handleResetSubmit = (e) => {
        e.preventDefault();

        if (!confirm('Reset akan mengosongkan data karyawan, absensi, payroll, dan shift. Akun admin serta pengaturan tetap disimpan. Lanjutkan?')) {
            return;
        }

        postReset('/pemeliharaan-data/reset', {
            onSuccess: () => resetResetForm(),
        });
    };

    return (
        <MainLayout title="Database">
            <Head title="Database" />

            <div className="max-w-4xl mx-auto space-y-5">
                <div>
                    <h2 className="text-sm font-extrabold text-slate-900 leading-none mb-1">Pemeliharaan Database</h2>
                    <p className="text-[10px] text-slate-500 font-medium">
                        Backup, restore, dan reset data aplikasi. Gunakan fitur ini dengan hati-hati karena restore dan reset dapat mengubah banyak data sekaligus.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
                    <div className={`${cardClass} border border-slate-100`}>
                        <div>
                            <div className={`${iconClass} bg-blue-50 text-blue-700`}>
                                <Download className="w-4 h-4" />
                            </div>
                            <h3 className={titleClass}>Backup Database</h3>
                            <p className={descriptionClass}>
                                Unduh file backup JSON berisi data akun, pengaturan, shift, karyawan, absensi, dan payroll.
                            </p>
                        </div>
                        <div className="flex-1" />
                        <div className="pt-5">
                            <a
                                href="/pemeliharaan-data/backup"
                                className={`${actionButtonClass} bg-blue-700 hover:bg-blue-800`}
                            >
                                <Archive className="w-3.5 h-3.5" />
                                Download Backup
                            </a>
                        </div>
                    </div>

                    <form onSubmit={handleRestoreSubmit} className={`${cardClass} border border-slate-100`}>
                        <div>
                            <div className={`${iconClass} bg-amber-50 text-amber-700`}>
                                <Upload className="w-4 h-4" />
                            </div>
                            <h3 className={titleClass}>Restore Database</h3>
                            <p className={descriptionClass}>
                                Upload file backup .mbg. Ketik <span className="font-extrabold text-slate-900">RESTORE</span> untuk konfirmasi.
                            </p>
                        </div>

                        <div className="flex-1 pt-5 space-y-3">
                            <label className="flex h-10 w-full cursor-pointer items-center overflow-hidden rounded-xl border border-slate-200 bg-white text-xs text-slate-500 transition-colors hover:border-amber-200">
                                <span className="h-full shrink-0 bg-amber-50 px-3 text-[10px] font-extrabold text-amber-700 flex items-center">
                                    Choose File
                                </span>
                                <span className="min-w-0 flex-1 truncate px-3">
                                    {selectedFileName || 'No file chosen'}
                                </span>
                                <input
                                    type="file"
                                    accept=".mbg,.json,application/json"
                                    onChange={(e) => {
                                        const file = e.target.files[0] || null;
                                        setRestoreData('backup_file', file);
                                        setSelectedFileName(file ? file.name : '');
                                    }}
                                    className="sr-only"
                                />
                            </label>
                            {restoreErrors.backup_file && <p className="text-[10px] text-rose-600">{restoreErrors.backup_file}</p>}

                            <input
                                type="text"
                                value={restoreData.confirmation}
                                onChange={(e) => setRestoreData('confirmation', e.target.value)}
                                className="w-full h-10 text-xs px-3 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-bold"
                                placeholder="Ketik RESTORE"
                            />
                            {restoreErrors.confirmation && <p className="text-[10px] text-rose-600">{restoreErrors.confirmation}</p>}
                        </div>

                        <div className="pt-5">
                            <button
                                type="submit"
                                disabled={restoring || !restoreData.backup_file}
                                className={`${actionButtonClass} bg-amber-600 hover:bg-amber-700`}
                            >
                                <Upload className="w-3.5 h-3.5" />
                                {restoring ? 'Memproses...' : 'Restore Backup'}
                            </button>
                        </div>
                    </form>

                    <form onSubmit={handleResetSubmit} className={`${cardClass} border border-rose-100`}>
                        <div>
                            <div className={`${iconClass} bg-rose-50 text-rose-700`}>
                                <RotateCcw className="w-4 h-4" />
                            </div>
                            <h3 className={titleClass}>Reset Data Operasional</h3>
                            <p className={descriptionClass}>
                                Mengosongkan karyawan, shift, absensi, dan payroll. Akun admin dan pengaturan tidak dihapus.
                            </p>
                        </div>

                        {userRole === 'superadmin' ? (
                            <>
                                <div className="flex-1 pt-5 space-y-3">
                                    <div className="min-h-[66px] p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2">
                                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-rose-700 font-semibold leading-relaxed">
                                            Pastikan sudah backup sebelum reset. Data yang dihapus tidak dapat dikembalikan tanpa file backup.
                                        </p>
                                    </div>

                                    <input
                                        type="text"
                                        value={resetData.confirmation}
                                        onChange={(e) => setResetData('confirmation', e.target.value)}
                                        className="w-full h-10 text-xs px-3 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-bold"
                                        placeholder="Ketik RESET"
                                    />
                                    {resetErrors.confirmation && <p className="text-[10px] text-rose-600">{resetErrors.confirmation}</p>}
                                </div>

                                <div className="pt-5">
                                    <button
                                        type="submit"
                                        disabled={resetting}
                                        className={`${actionButtonClass} bg-rose-600 hover:bg-rose-700`}
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        {resetting ? 'Mengosongkan...' : 'Reset Data'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 pt-5 flex flex-col justify-center">
                                <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-slate-600 font-semibold leading-relaxed">
                                        Akses Ditolak: Hanya IT Team (Superadmin) yang diizinkan untuk mengosongkan/reset database operasional.
                                    </p>
                                </div>
                                <div className="pt-5">
                                    <button
                                        type="button"
                                        disabled
                                        className={`${actionButtonClass} bg-slate-300 cursor-not-allowed text-slate-500`}
                                    >
                                        <Lock className="w-3.5 h-3.5" />
                                        Reset Terkunci
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
                        <DatabaseIcon className="w-4 h-4 text-blue-700" />
                        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Ringkasan Tabel</h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {tableStats.map((table) => (
                            <div key={table.name} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">{table.name}</p>
                                <p className="text-lg font-black text-slate-900 tabular-nums leading-none mt-1">{table.count}</p>
                                <p className={`text-[9px] font-bold mt-1 ${table.resettable ? 'text-rose-500' : 'text-blue-500'}`}>
                                    {table.resettable ? 'Ikut reset' : 'Disimpan'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
