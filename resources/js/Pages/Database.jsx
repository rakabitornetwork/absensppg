import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import MainLayout from '../Layout/MainLayout';
import { AlertTriangle, Archive, Database as DatabaseIcon, Download, RotateCcw, Upload } from 'lucide-react';

export default function Database({ tableStats = [] }) {
    const [selectedFileName, setSelectedFileName] = useState('');

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

        postRestore('/database-maintenance/restore', {
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

        postReset('/database-maintenance/reset', {
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                            <Download className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1">Backup Database</h3>
                        <p className="text-[10px] text-slate-500 leading-relaxed mb-4">
                            Unduh file backup JSON berisi data akun, pengaturan, shift, karyawan, absensi, dan payroll.
                        </p>
                        <a
                            href="/database-maintenance/backup"
                            className="inline-flex w-full items-center justify-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm active:translate-y-[1px] transition-all"
                        >
                            <Archive className="w-3.5 h-3.5" />
                            Download Backup
                        </a>
                    </div>

                    <form onSubmit={handleRestoreSubmit} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                            <Upload className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1">Restore Database</h3>
                        <p className="text-[10px] text-slate-500 leading-relaxed mb-3">
                            Upload file backup .mbg. Ketik <span className="font-extrabold text-slate-900">RESTORE</span> untuk konfirmasi.
                        </p>

                        <input
                            type="file"
                            accept=".mbg,.json,application/json"
                            onChange={(e) => {
                                const file = e.target.files[0] || null;
                                setRestoreData('backup_file', file);
                                setSelectedFileName(file ? file.name : '');
                            }}
                            className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 file:cursor-pointer"
                        />
                        {selectedFileName && <p className="text-[9px] text-slate-400 mt-1 truncate">File: {selectedFileName}</p>}
                        {restoreErrors.backup_file && <p className="text-[10px] text-rose-600 mt-1">{restoreErrors.backup_file}</p>}

                        <input
                            type="text"
                            value={restoreData.confirmation}
                            onChange={(e) => setRestoreData('confirmation', e.target.value)}
                            className="w-full mt-3 text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-bold"
                            placeholder="Ketik RESTORE"
                        />
                        {restoreErrors.confirmation && <p className="text-[10px] text-rose-600 mt-1">{restoreErrors.confirmation}</p>}

                        <button
                            type="submit"
                            disabled={restoring || !restoreData.backup_file}
                            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm active:translate-y-[1px] transition-all disabled:opacity-50"
                        >
                            <Upload className="w-3.5 h-3.5" />
                            {restoring ? 'Memproses...' : 'Restore Backup'}
                        </button>
                    </form>

                    <form onSubmit={handleResetSubmit} className="bg-white border border-rose-100 rounded-2xl p-4 shadow-sm">
                        <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mb-3">
                            <RotateCcw className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1">Reset Data Operasional</h3>
                        <p className="text-[10px] text-slate-500 leading-relaxed mb-3">
                            Mengosongkan karyawan, shift, absensi, dan payroll. Akun admin dan pengaturan tidak dihapus.
                        </p>

                        <div className="p-2 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-2 mb-3">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-rose-700 font-semibold leading-relaxed">
                                Pastikan sudah backup sebelum reset. Data yang dihapus tidak dapat dikembalikan tanpa file backup.
                            </p>
                        </div>

                        <input
                            type="text"
                            value={resetData.confirmation}
                            onChange={(e) => setResetData('confirmation', e.target.value)}
                            className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500 font-bold"
                            placeholder="Ketik RESET"
                        />
                        {resetErrors.confirmation && <p className="text-[10px] text-rose-600 mt-1">{resetErrors.confirmation}</p>}

                        <button
                            type="submit"
                            disabled={resetting}
                            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm active:translate-y-[1px] transition-all disabled:opacity-50"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            {resetting ? 'Mengosongkan...' : 'Reset Data'}
                        </button>
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
