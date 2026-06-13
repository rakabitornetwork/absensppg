import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '../Layout/MainLayout';
import { 
    Tag, 
    RefreshCw, 
    CheckCircle2, 
    AlertCircle, 
    Terminal, 
    Info, 
    Loader2, 
    ArrowLeft,
    ShieldCheck
} from 'lucide-react';

const GithubIcon = (props) => (
    <svg 
        viewBox="0 0 24 24" 
        width="24" 
        height="24" 
        stroke="currentColor" 
        strokeWidth="2" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
);

export default function Update({ currentVersion, commitHash, gitAvailable, isGitRepo, repoName }) {
    const [checking, setChecking] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [updateInfo, setUpdateInfo] = useState(null);
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState('idle'); // idle, check_success, check_failed, updating, update_success, update_failed
    const [errorMsg, setErrorMsg] = useState('');

    const checkForUpdates = async () => {
        setChecking(true);
        setStatus('checking');
        setErrorMsg('');
        try {
            const response = await fetch('/update/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                }
            });
            const data = await response.json();
            
            if (data.status === 'success' || data.status === 'warning') {
                setUpdateInfo(data);
                setStatus('check_success');
                if (data.status === 'warning') {
                    setLogs(prev => [...prev, `Peringatan: ${data.message}`]);
                }
            } else {
                setStatus('check_failed');
                setErrorMsg(data.message || 'Gagal memeriksa update.');
            }
        } catch (error) {
            setStatus('check_failed');
            setErrorMsg('Kesalahan jaringan saat menghubungi server.');
            console.error(error);
        } finally {
            setChecking(false);
        }
    };

    useEffect(() => {
        checkForUpdates();
    }, []);

    const triggerUpdate = async () => {
        if (!confirm('Apakah Anda yakin ingin memperbarui aplikasi sekarang? Ini akan menarik perubahan kode terbaru dari GitHub dan mereset cache server.')) {
            return;
        }

        setUpdating(true);
        setStatus('updating');
        setLogs(['Memulai proses update otomatis...', 'Menghubungi repositori GitHub...']);

        try {
            const response = await fetch('/update/run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                }
            });
            const data = await response.json();
            
            if (data.logs) {
                setLogs(prev => [...prev, ...data.logs]);
            }

            if (response.ok && data.status === 'success') {
                setStatus('update_success');
                setLogs(prev => [...prev, 'Proses update selesai! Aplikasi telah dimigrasikan dan dioptimasi.']);
                // Reload page after a delay to pull new assets/version in header
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            } else {
                setStatus('update_failed');
                setErrorMsg(data.message || 'Proses update gagal dijalankan.');
            }
        } catch (error) {
            setStatus('update_failed');
            setErrorMsg('Terjadi kegagalan koneksi saat menjalankan update.');
            console.error(error);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <MainLayout title="Update Aplikasi">
            <Head title="Update Aplikasi" />

            <div className="max-w-3xl mx-auto">
                {/* Back Link */}
                <div className="mb-4 flex items-center justify-between">
                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Kembali ke Dashboard
                    </Link>

                    {/* Screenshot-like version badge, light mode */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-md text-[10px] sm:text-[11px] font-bold shadow-xs">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        <span>Tag: <span className="text-slate-800 font-extrabold">{currentVersion}-{commitHash}</span></span>
                        <svg className="w-2.5 h-2.5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M7 10l5 5 5-5H7z" />
                        </svg>
                    </div>
                </div>

                {/* Main Header */}
                <div className="mb-5">
                    <h2 className="text-base font-extrabold text-slate-900 leading-none mb-1">Update Otomatis</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                    
                    {/* Status & Info Panel */}
                    <div className="md:col-span-1 space-y-4 h-full">
                        
                        {/* Current Status Card */}
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm h-full min-h-[236px]">
                            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3 border-b border-slate-50 pb-1.5">
                                Status Sistem
                            </h3>
                            <div className="space-y-3 text-xs font-semibold">
                                <div>
                                    <span className="block text-[9px] text-slate-400 font-bold uppercase">Versi Terinstal</span>
                                    <span className="font-bold text-slate-800 flex items-center gap-1">
                                        v{currentVersion} <span className="text-[10px] font-mono text-slate-400">({commitHash})</span>
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-[9px] text-slate-400 font-bold uppercase">Git Integrasi</span>
                                    {isGitRepo ? (
                                        <span className="text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-md border border-teal-100 text-[10px] inline-block font-bold">
                                            Aktif (Git Repo)
                                        </span>
                                    ) : (
                                        <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100 text-[10px] inline-block font-bold">
                                            Lokal (Non-Git)
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <span className="block text-[9px] text-slate-400 font-bold uppercase">Git Binary</span>
                                    {gitAvailable ? (
                                        <span className="text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-md border border-teal-100 text-[10px] inline-block font-bold">
                                            Tersedia di Server
                                        </span>
                                    ) : (
                                        <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100 text-[10px] inline-block font-bold">
                                            Tidak Terdeteksi
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>


                    </div>

                    {/* Check & Run Panel */}
                    <div className="md:col-span-2 space-y-4 h-full">
                        
                        {/* Control Actions */}
                        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm h-full min-h-[236px]">
                            <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2">
                                <div className="flex items-center gap-2">
                                    <GithubIcon className="w-4 h-4 text-slate-800" />
                                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Pemeriksaan Repositori</h3>
                                </div>
                                <button
                                    onClick={checkForUpdates}
                                    disabled={checking || updating}
                                    className="bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
                                    {checking ? 'Memeriksa...' : 'Cek Update'}
                                </button>
                            </div>

                            {/* State: Check success, no update */}
                            {status === 'check_success' && updateInfo && !updateInfo.updateAvailable && (
                                <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-xl mb-4 flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                                    <div className="text-xs">
                                        <h4 className="font-extrabold text-teal-900">Aplikasi Sudah Versi Terbaru</h4>
                                        <p className="text-teal-700 font-medium mt-0.5">
                                            Commit terpasang sama dengan commit terbaru di cabang <span className="font-bold">main</span> GitHub: <span className="font-mono bg-teal-100/50 px-1 py-0.2 rounded font-bold">{updateInfo.latestHash}</span>.
                                        </p>
                                        <div className="mt-2.5 p-2 bg-white/60 border border-teal-100/60 rounded-lg text-[10px] text-teal-800 font-medium">
                                            <strong>Commit Terakhir:</strong> "{updateInfo.latestMessage}" ({updateInfo.latestDate})
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* State: Check success, update available */}
                            {status === 'check_success' && updateInfo && updateInfo.updateAvailable && (
                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl mb-4">
                                    <div className="flex items-start gap-3 mb-3">
                                        <RefreshCw className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-spin" style={{ animationDuration: '3s' }} />
                                        <div className="text-xs">
                                            <h4 className="font-extrabold text-amber-900">Pembaruan Kode Tersedia</h4>
                                            <p className="text-amber-700 font-medium mt-0.5">
                                                Ditemukan commit baru di GitHub: <span className="font-mono bg-amber-100 px-1 py-0.2 rounded font-bold">{updateInfo.latestHash}</span> (Lokal: {commitHash}).
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-2.5 bg-white/80 border border-amber-200/60 rounded-lg text-[10px] text-slate-700 mb-3 space-y-1">
                                        <p><strong>Pesan Update:</strong> "{updateInfo.latestMessage}"</p>
                                        <p><strong>Waktu Commit:</strong> {updateInfo.latestDate}</p>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={triggerUpdate}
                                            disabled={updating}
                                            className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all active:translate-y-[1px] disabled:opacity-50"
                                        >
                                            <RefreshCw className="w-3.5 h-3.5" />
                                            Update Sekarang
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* State: Check failed */}
                            {status === 'check_failed' && (
                                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl mb-4 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                                    <div className="text-xs">
                                        <h4 className="font-extrabold text-rose-900">Pemeriksaan Gagal</h4>
                                        <p className="text-rose-700 font-medium mt-0.5">{errorMsg}</p>
                                    </div>
                                </div>
                            )}

                            {/* State: Idle / Instructions */}
                            {(status === 'idle' || status === 'checking') && (
                                <div className="py-8 text-center text-slate-400">
                                    {status === 'checking' ? (
                                        <>
                                            <Loader2 className="w-8 h-8 mx-auto text-teal-600 animate-spin mb-2" />
                                            <p className="text-xs font-bold text-slate-700">Menghubungi API GitHub...</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">Memeriksa hash commit terbaru di repository</p>
                                        </>
                                    ) : (
                                        <>
                                            <GithubIcon className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                            <p className="text-xs font-bold text-slate-600">Klik "Cek Update" untuk mulai</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">Sistem akan membandingkan commit lokal Anda dengan server origin GitHub</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Console terminal window for execution logs */}
                        {(logs.length > 0 || status === 'updating') && (
                            <div className="bg-slate-900 text-slate-100 border border-slate-950 rounded-xl p-4 shadow-md font-mono text-[10px] leading-relaxed">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Terminal className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Log Konsol Update VPS</span>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                                        <span className="w-2.5 h-2.5 rounded-full bg-teal-500/80" />
                                    </div>
                                </div>
                                <div className="max-h-48 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
                                    {logs.map((log, index) => (
                                        <div key={index} className="whitespace-pre-wrap">
                                            {log.startsWith('Executing:') ? (
                                                <span className="text-teal-400 font-bold">$ {log.substring(11)}</span>
                                            ) : log.startsWith('Error:') || log.startsWith('Migration Error:') ? (
                                                <span className="text-rose-400">{log}</span>
                                            ) : log.startsWith('Peringatan:') ? (
                                                <span className="text-amber-400">{log}</span>
                                            ) : (
                                                <span className="text-slate-300">{log}</span>
                                            )}
                                        </div>
                                    ))}
                                    {updating && (
                                        <div className="flex items-center gap-1.5 text-teal-400 mt-1">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            <span>Mengeksekusi perintah shell...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                </div>
            </div>
        </MainLayout>
    );
}
