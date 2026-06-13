import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Check, ShieldAlert, Sparkles, Loader2, ArrowLeft } from 'lucide-react';

export default function Scanner({ settings }) {
    const { props } = usePage();
    const { auth, appLogo, appTitle, appSubtitle, officeName } = props;
    const [cameras, setCameras] = useState([
        { id: 'user', label: 'Kamera Depan Default' },
        { id: 'environment', label: 'Kamera Belakang Default' }
    ]);
    const [selectedCamera, setSelectedCamera] = useState('user');
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [processing, setProcessing] = useState(false);
    const [manualToken, setManualToken] = useState('');
    const [scanMode, setScanMode] = useState('in'); // 'in' or 'out'
    const qrScannerRef = useRef(null);
    const lastScanRef = useRef({ token: null, mode: null, time: 0 });
    const scanModeRef = useRef('in');

    const formatMinutesDuration = (minutes) => {
        const totalMinutes = Number(minutes) || 0;

        if (totalMinutes < 60) {
            return `${totalMinutes} menit`;
        }

        const hours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;

        return remainingMinutes > 0
            ? `${hours} jam ${remainingMinutes} menit`
            : `${hours} jam`;
    };

    // Audio chime generator using Web Audio API
    const playChime = (type) => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const gain = ctx.createGain();
            gain.connect(ctx.destination);

            if (type === 'success') {
                // Happy high chime (two notes: G5 then C6)
                const osc1 = ctx.createOscillator();
                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(783.99, ctx.currentTime); // G5
                osc1.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.08); // C6
                
                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
                
                osc1.connect(gain);
                osc1.start();
                osc1.stop(ctx.currentTime + 0.35);
            } else {
                // Error double buzz (low C3)
                const osc = ctx.createOscillator();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(130.81, ctx.currentTime); // C3
                osc.frequency.setValueAtTime(110.00, ctx.currentTime + 0.1); // A2
                
                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
                
                osc.connect(gain);
                osc.start();
                osc.stop(ctx.currentTime + 0.35);
            }
        } catch (e) {
            console.warn("Web Audio API not allowed/supported in browser yet", e);
        }
    };

    const startScanner = async (cameraSelector) => {
        if (!cameraSelector) return;
        setErrorMsg('');
        setScanResult(null);

        try {
            // Re-use existing instance to prevent "Html5Qrcode is active" conflicts
            let scanner = qrScannerRef.current;
            if (!scanner) {
                scanner = new Html5Qrcode("reader");
                qrScannerRef.current = scanner;
            }

            // Stop scanner if already scanning to prepare for new source
            if (scanner.isScanning) {
                await scanner.stop();
            }

            // If cameraSelector is 'user' or 'environment', we pass as facingMode config object
            const configSource = (cameraSelector === 'user' || cameraSelector === 'environment')
                ? { facingMode: cameraSelector }
                : cameraSelector;

            await scanner.start(
                configSource,
                {
                    fps: 10,
                    qrbox: { width: 230, height: 230 },
                },
                (decodedText) => {
                    // Success callback
                    handleScan(decodedText);
                },
                (errorMessage) => {
                    // Continuous scan output, skip logging
                }
            );

            setIsScanning(true);
        } catch (err) {
            setErrorMsg("Gagal menjalankan scanner kamera: " + err.message);
            console.error(err);
        }
    };

    const stopScanner = async () => {
        if (qrScannerRef.current && qrScannerRef.current.isScanning) {
            try {
                await qrScannerRef.current.stop();
                setIsScanning(false);
            } catch (err) {
                console.error("Error stopping camera scanner", err);
            }
        }
    };

    // Initialize available cameras and start scanner automatically
    useEffect(() => {
        // Check if browser context is secure (getUserMedia requires localhost, 127.0.0.1, or HTTPS)
        const isSecure = window.location.protocol === 'https:' || 
                         window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';

        if (!isSecure) {
            setErrorMsg("Akses kamera diblokir karena halaman tidak diakses melalui koneksi aman (localhost atau HTTPS). Silakan periksa URL Anda.");
            return;
        }

        // Check WebRTC support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setErrorMsg("Peramban Anda tidak mendukung akses kamera langsung (WebRTC). Silakan gunakan Chrome/Firefox terbaru.");
            return;
        }

        // Auto start scanning with the default front-facing camera selector immediately
        setSelectedCamera('user');
        startScanner('user');

        // request camera permissions and enumerate devices in background
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                // Immediately release tracks to unlock camera for html5-qrcode
                stream.getTracks().forEach(track => track.stop());

                // Now enumerate the cameras
                return Html5Qrcode.getCameras();
            })
            .then((devices) => {
                if (devices && devices.length > 0) {
                    // Prepend default selectors to the list of available devices
                    const list = [
                        { id: 'user', label: 'Kamera Depan Default' },
                        { id: 'environment', label: 'Kamera Belakang Default' },
                        ...devices
                    ];
                    setCameras(list);
                }
            })
            .catch((err) => {
                console.warn("Could not enumerate camera devices list:", err);
                // Do not overwrite errorMsg if the default 'user' camera is already running fine!
            });

        // Cleanup scanner on unmount
        return () => {
            stopScanner();
        };
    }, []);

    const toggleScanning = () => {
        if (isScanning) {
            stopScanner();
        } else {
            startScanner(selectedCamera);
        }
    };

    const changeScanMode = (mode) => {
        scanModeRef.current = mode;
        setScanMode(mode);
    };

    const handleScan = (token) => {
        // Prevent double trigger during execution
        if (processing) return;

        const now = Date.now();
        const currentMode = scanModeRef.current;
        if (lastScanRef.current.token === token && lastScanRef.current.mode === currentMode && (now - lastScanRef.current.time) < 5000) {
            console.log("Ignoring duplicate scan of token:", token);
            return;
        }

        lastScanRef.current = { token, mode: currentMode, time: now };
        setProcessing(true);
        setErrorMsg('');

        // Pause camera decoding temporarily
        if (qrScannerRef.current) {
            // html5-qrcode doesn't have an official pause, so we stop & restart or just block requests
        }

        // Post QR Token to Backend
        fetch('/attendance/scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ qr_token: token, mode: currentMode })
        })
        .then(async (res) => {
            const data = await res.json();
            if (res.ok) {
                setScanResult({
                    status: data.status,
                    type: data.type,
                    employee: data.employee,
                    time: data.time,
                    attendance_status: data.attendance_status,
                    late_minutes: data.late_minutes,
                    message: data.message
                });
                playChime('success');
            } else {
                setScanResult({
                    status: data.status || 'error',
                    message: data.message || 'Terjadi kesalahan pemindaian.'
                });
                playChime('error');
            }
        })
        .catch((err) => {
            setErrorMsg("Koneksi gagal. Harap periksa jaringan server.");
            playChime('error');
        })
        .finally(() => {
            setProcessing(false);
            // Clear manual input field
            setManualToken('');
            
            // Auto reset card view after 5 seconds
            setTimeout(() => {
                setScanResult(null);
            }, 6000);
        });
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (!manualToken.trim()) return;
        handleScan(manualToken.trim());
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,rgba(20,184,166,0.16),transparent_28%),linear-gradient(135deg,#ecfeff_0%,#f8fafc_48%,#dbeafe_100%)] p-4 text-slate-800 antialiased font-sans sm:p-6">
            <Head title="Scan QR Code" />

            <div className="mx-auto mb-5 flex max-w-5xl flex-col gap-3 rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm shadow-blue-900/5 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Link
                        href="/login"
                        className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                        aria-label="Masuk ke halaman login"
                    >
                        {appLogo ? (
                            <img src={appLogo} className="h-full w-full object-contain p-1.5" alt="Logo" />
                        ) : (
                            <span className="flex h-full w-full items-center justify-center bg-teal-600 text-white shadow-lg shadow-teal-500/20">
                                <Camera className="h-5 w-5" />
                            </span>
                        )}
                    </Link>
                    <div>
                        <h1 className="text-sm font-extrabold leading-tight text-slate-950">Scan Absensi</h1>
                        <p className="text-[10px] font-bold text-slate-500">
                            {officeName || appTitle || 'SPPG MBG'}{appSubtitle ? ` - ${appSubtitle}` : ''}
                        </p>
                    </div>
                </div>

                {auth?.user && (
                    <Link
                        href="/dashboard"
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-extrabold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Kembali ke Dashboard
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-5xl mx-auto items-stretch">
                
                {/* Left Side: Scanner Viewport (7 columns) */}
                <div className="lg:col-span-7">
                    <div className="h-full min-h-[560px] bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col items-center">
                        <div className="w-full flex items-center gap-2 border-b border-slate-50 pb-2 mb-3">
                            <Camera className="w-4.5 h-4.5 text-teal-600" />
                            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Kamera Scanner</h3>
                        </div>

                        {/* Scan Mode Tab Selector */}
                        <div className="w-full flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 mb-3.5">
                            <button
                                type="button"
                                onClick={() => changeScanMode('in')}
                                className={`flex-1 py-1.5 text-[10px] font-extrabold rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${scanMode === 'in' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-850'}`}
                            >
                                SCAN MASUK
                            </button>
                            <button
                                type="button"
                                onClick={() => changeScanMode('out')}
                                className={`flex-1 py-1.5 text-[10px] font-extrabold rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${scanMode === 'out' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-850'}`}
                            >
                                SCAN PULANG
                            </button>
                        </div>

                        {/* Camera Select Dropdown */}
                        <div className="w-full mb-3 flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">Pilih Kamera:</span>
                            <select
                                value={selectedCamera}
                                onChange={(e) => {
                                    setSelectedCamera(e.target.value);
                                    if (isScanning) {
                                        stopScanner().then(() => startScanner(e.target.value));
                                    }
                                }}
                                disabled={cameras.length <= 1}
                                className="flex-1 text-xs border border-slate-200 rounded-lg p-1 px-2 focus:outline-none bg-slate-50 font-medium"
                            >
                                {cameras.map((cam) => (
                                    <option key={cam.id} value={cam.id}>
                                        {cam.label || `Kamera ${cam.id.substring(0, 8)}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Viewport Frame */}
                        <div className="w-full max-w-[340px] aspect-square bg-slate-900 rounded-xl overflow-hidden border border-slate-950 relative flex items-center justify-center shadow-inner">
                            <div id="reader" className="w-full h-full" />
                            
                            {!isScanning && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-950/90 p-4 text-center z-10">
                                    <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-2" />
                                    <p className="text-[11px] font-bold text-slate-400">Mengaktifkan kamera...</p>
                                </div>
                            )}

                            {isScanning && processing && (
                                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-15">
                                    <div className="bg-white border border-slate-100 rounded-xl p-3 flex items-center gap-2.5 shadow-lg">
                                        <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
                                        <span className="text-xs font-bold text-slate-800">Memproses Kartu...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {errorMsg && (
                            <div className="w-full mt-3 p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-[10px] text-rose-700 font-bold flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                                {errorMsg}
                            </div>
                        )}
                        <div className="flex-1" />

                        {/* Manual Input Fallback */}
                        <div className="w-full border-t border-slate-100 pt-4 mt-4">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Input Kode Manual (Alternatif)</h4>
                            <form onSubmit={handleManualSubmit} className="flex gap-2">
                            <input
                                type="text"
                                value={manualToken}
                                onChange={(e) => setManualToken(e.target.value)}
                                className="flex-1 text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-teal-500/20 focus:border-teal-500"
                                placeholder="Masukkan token QR Kartu (Contoh: SPPG-TOKEN-BUDI-001)"
                            />
                            <button
                                type="submit"
                                disabled={processing || !manualToken.trim()}
                                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 rounded-lg active:translate-y-[1px] transition-all disabled:opacity-50"
                            >
                                Kirim
                            </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right Side: Scan Response Card (5 columns) */}
                <div className="lg:col-span-5">
                    <div className="h-full min-h-[560px] bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                        <div className="flex flex-1 flex-col">
                            <div className="flex items-center gap-1.5 border-b border-slate-50 pb-2 mb-4">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Hasil Pemindaian</h3>
                            </div>

                            {/* Response Display Box */}
                            {!scanResult ? (
                                <div className="flex flex-1 flex-col items-center justify-center text-center text-slate-400">
                                    <div className="w-12 h-12 rounded-full border border-dashed border-slate-300 flex items-center justify-center mx-auto mb-2 text-slate-300">
                                        <Camera className="w-5 h-5" />
                                    </div>
                                    <p className="text-[11px] font-bold">Menunggu Scan Kartu...</p>
                                    <p className="text-[9px] text-slate-500 mt-1">Tempelkan QR Code kartu karyawan pada area bidik kamera.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in duration-200">
                                    
                                    {/* Success Result Container */}
                                    {scanResult.status === 'success' && (
                                        <div className="bg-teal-50/40 border border-teal-100 rounded-xl p-4 flex flex-col items-center text-center">
                                            <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/20 mb-2.5">
                                                <Check className="w-5 h-5" />
                                            </div>
                                            
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded-md mb-2">
                                                {scanResult.type === 'in' ? 'CLOCK IN (MASUK)' : 'CLOCK OUT (PULANG)'}
                                            </span>

                                            <h4 className="text-sm font-extrabold text-slate-900 leading-tight mb-0.5">{scanResult.employee.name}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold tabular-nums mb-1">{scanResult.employee.nip} • {scanResult.employee.role}</p>
                                            
                                            <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-100 flex items-center gap-2 mt-2 shadow-sm">
                                                <span className="text-[10px] text-slate-400 font-bold">WAKTU:</span>
                                                <span className="text-sm font-extrabold text-slate-800 tabular-nums">{scanResult.time} WIB</span>
                                            </div>

                                            {scanResult.attendance_status === 'Late' && (
                                                <div className="mt-3 p-2 bg-amber-50 border border-amber-100 rounded-lg text-[9px] text-amber-800 font-bold leading-normal">
                                                    Terlambat {formatMinutesDuration(scanResult.late_minutes)}. Denda akan diakumulasikan ke penggajian bulanan.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Warnings and Errors */}
                                    {(scanResult.status === 'warning' || scanResult.status === 'error') && (
                                        <div className="bg-rose-50/40 border border-rose-100 rounded-xl p-4 flex flex-col items-center text-center">
                                            <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 mb-2.5">
                                                <ShieldAlert className="w-5 h-5" />
                                            </div>

                                            <span className="text-[9px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md mb-2">
                                                GAGAL / DUPLIKAT
                                            </span>

                                            <p className="text-xs font-bold text-slate-800 leading-relaxed max-w-[240px]">
                                                {scanResult.message}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Bottom Instruction Panel */}
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[9px] text-slate-500 leading-normal">
                            <strong>Aturan Shift SPPG:</strong>
                            <ul className="list-disc pl-3 mt-1 space-y-0.5">
                                <li>Scan masuk dilakukan 05:30 - {settings.late_grace_time || '06:30'} WIB.</li>
                                <li>Scan pulang dapat dilakukan di atas pukul 15:00 WIB.</li>
                                <li>Jika kamera gagal fokus, bersihkan kamera laptop/tablet atau gunakan menu input manual di sebelah kiri.</li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
