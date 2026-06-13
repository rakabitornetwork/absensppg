import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Printer, UserCircle2 } from 'lucide-react';

export default function PrintCards({ employees = [] }) {
    const { props } = usePage();
    const officeName = props.officeName || 'SPPG Sukajadi Mandiri';
    const officeAddress = props.officeAddress || '';
    const officeWhatsapp = props.officeWhatsapp || '';
    const officeEmail = props.officeEmail || '';
    const officeNotes = props.officeNotes || 'BERLAKU TAHUN ANGGARAN 2026';
    
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-100 print:bg-white p-6 print:p-0 antialiased font-sans">
            <Head title="Cetak Kartu Karyawan" />
            <style>{`
                @media print {
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

            {/* Print Header Controls (Hidden during printing) */}
            <div className="max-w-4xl mx-auto mb-6 bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between print:hidden">
                <div className="flex items-center gap-3">
                    <Link
                        href="/employees"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                        title="Kembali"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Cetak Kartu Karyawan</h1>
                        <p className="text-[10px] text-slate-500 font-bold">Total: {employees.length} Kartu Aktif</p>
                    </div>
                </div>
                <button
                    onClick={handlePrint}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md hover:shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 transition-all flex items-center gap-1.5 active:translate-y-[1px]"
                >
                    <Printer className="w-4 h-4" />
                    Cetak Halaman (Print/PDF)
                </button>
            </div>

            {/* Print Layout Sheet */}
            <div className="max-w-4xl mx-auto bg-white print:border-0 p-8 print:p-0 rounded-2xl border border-slate-200/60 shadow-sm print:shadow-none min-h-[297mm]">
                {/* 3x2 Grid layout (standard business card / badge print sheet) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
                    {employees.map((emp) => (
                        <div 
                            key={emp.id} 
                            className="h-[105mm] w-[74mm] mx-auto relative overflow-hidden rounded-[22px] bg-slate-950 text-white shadow-2xl shadow-slate-900/25 ring-1 ring-slate-900/10 print:shadow-none break-inside-avoid"
                        >
                            {/* Premium background layers */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(20,184,166,0.42),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(245,158,11,0.22),transparent_26%),linear-gradient(145deg,#020617_0%,#0f172a_55%,#042f2e_100%)]" />
                            <div className="absolute -top-14 -right-12 w-32 h-32 rounded-full border-[18px] border-white/5" />
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-300 via-teal-300 to-cyan-300" />
                            <div className="absolute inset-x-3 bottom-3 h-28 rounded-[24px] bg-white/[0.06] blur-sm" />

                            <div className="relative z-10 h-full p-4 flex flex-col">
                                {/* Brand Header */}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-[5.5px] font-black tracking-[0.24em] uppercase text-amber-200/90">Official Staff Card</p>
                                        <h2 className="text-[9px] font-black leading-tight uppercase text-white mt-1 max-w-[150px]">{officeName}</h2>
                                        <p className="text-[6px] text-teal-100/80 font-bold uppercase tracking-[0.18em] mt-0.5">SPPG MBG</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 shadow-inner">
                                        <span className="text-[10px] font-black tracking-tight text-amber-100">ID</span>
                                    </div>
                                </div>

                                {/* Employee Photo */}
                                <div className="flex flex-col items-center mt-4">
                                    <div className="relative">
                                        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-amber-200 via-teal-200 to-cyan-300 opacity-90" />
                                        <div className="relative w-[22mm] h-[22mm] rounded-full bg-slate-100 flex items-center justify-center border-[3px] border-slate-950 overflow-hidden shadow-xl">
                                            {emp.photo_path ? (
                                                <img src={emp.photo_path} className="w-full h-full object-cover" alt={emp.name} />
                                            ) : (
                                                <UserCircle2 className="w-14 h-14 text-slate-300" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-center mt-3 w-full">
                                        <h3 className="text-[13px] font-black text-white leading-tight truncate px-1">{emp.name}</h3>
                                        <span className="inline-flex max-w-full mt-1.5 px-2 py-0.5 rounded-full bg-amber-200 text-slate-950 border border-amber-100 text-[7px] font-black uppercase tracking-[0.12em] truncate">
                                            {emp.role}
                                        </span>
                                    </div>
                                </div>

                                {/* Detail Strip */}
                                <div className="mt-3 rounded-2xl bg-white/[0.08] border border-white/10 p-2.5 space-y-1.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[5.5px] font-black tracking-[0.18em] uppercase text-slate-300">NIP</span>
                                        <span className="text-[7px] font-black text-white tabular-nums truncate">{emp.nip}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[5.5px] font-black tracking-[0.18em] uppercase text-slate-300">Shift</span>
                                        <span className="text-[7px] font-black text-teal-100 uppercase truncate">{emp.shift?.name || 'Default Unit'}</span>
                                    </div>
                                </div>

                                {/* QR Area */}
                                <div className="mt-auto flex flex-col items-center">
                                    <div className="bg-white p-2.5 rounded-2xl shadow-xl border border-white">
                                        <QRCodeSVG 
                                            value={emp.qr_token} 
                                            size={92} 
                                            level="H"
                                        />
                                    </div>
                                    <p className="mt-1.5 text-[5.8px] text-teal-50/90 font-black uppercase tracking-[0.2em]">Scan Presensi QR</p>
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

                                {/* Footer Tag */}
                                <div className="mt-2 text-center border-t border-white/10 pt-1.5">
                                    <span className="text-[5px] text-amber-100/80 font-black tracking-[0.2em] uppercase">{officeNotes}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
