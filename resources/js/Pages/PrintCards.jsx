import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Printer, UserCircle2 } from 'lucide-react';

export default function PrintCards({ employees = [] }) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-100 print:bg-white p-6 print:p-0 antialiased font-sans">
            <Head title="Cetak Kartu Karyawan" />

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
                            className="bg-white border-2 border-slate-300 rounded-xl p-4 flex flex-col items-center justify-between h-[105mm] w-[74mm] mx-auto relative overflow-hidden shadow-sm print:shadow-none print:border-slate-400"
                        >
                            {/* Color Bar */}
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-600 to-emerald-500" />
                            
                            {/* Card Brand Header */}
                            <div className="text-center mt-2.5 mb-3">
                                <h2 className="text-[9px] font-extrabold text-slate-950 tracking-wide uppercase leading-tight">SPPG SUKAJADI MANDIRI</h2>
                                <p className="text-[6.5px] text-teal-700 font-extrabold uppercase tracking-widest mt-0.5">Makan Bergizi Gratis</p>
                            </div>

                            {/* Avatar placeholder */}
                            <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 mb-2">
                                <UserCircle2 className="w-10 h-10 text-slate-300" />
                            </div>

                            {/* Info */}
                            <div className="text-center mb-2.5">
                                <h3 className="text-xs font-extrabold text-slate-950 leading-tight truncate max-w-[200px]">{emp.name}</h3>
                                <span className="inline-block text-[8px] font-extrabold text-teal-700 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded-md mt-1 uppercase tracking-wide">
                                    {emp.role}
                                </span>
                                <span className="block text-[8px] font-bold text-slate-400 mt-1 tabular-nums">NIP: {emp.nip}</span>
                            </div>

                            {/* QR Code SVG */}
                            <div className="bg-white border border-slate-200 p-2 rounded-lg shadow-inner">
                                <QRCodeSVG 
                                    value={emp.qr_token} 
                                    size={95} 
                                    level="H"
                                />
                            </div>

                            {/* Footer Tag */}
                            <div className="mt-3 text-center border-t border-slate-100 w-full pt-1.5">
                                <span className="text-[6px] text-slate-400 font-bold tracking-widest uppercase">BERLAKU TAHUN ANGGARAN 2026</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
