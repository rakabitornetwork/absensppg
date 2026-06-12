import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';

export default function Payslip({ payroll, settings, kepalaSatuan }) {
    
    const monthsList = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const formatRupiah = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const handlePrint = () => {
        window.print();
    };

    const pad = (n) => n.toString().padStart(2, '0');
    const paymentDateStr = payroll.payment_date 
        ? new Date(payroll.payment_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        : '-';

    return (
        <div className="min-h-screen bg-slate-100 print:bg-white p-6 print:p-0 antialiased font-sans">
            <Head title={`Slip Gaji - ${payroll.employee.name}`} />

            {/* Navigation & Action Bar (Hidden when printing) */}
            <div className="max-w-xl mx-auto mb-6 bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between print:hidden">
                <Link
                    href="/payrolls"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1 text-[11px] font-bold"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Kembali Ke Payroll
                </Link>
                <button
                    onClick={handlePrint}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1 active:translate-y-[1px] transition-all"
                >
                    <Printer className="w-3.5 h-3.5" />
                    Cetak Slip Gaji
                </button>
            </div>

            {/* Payslip Sheet Card */}
            <div className="max-w-xl mx-auto bg-white p-8 print:p-4 rounded-2xl border border-slate-200 shadow-md print:shadow-none print:border-0 relative">
                
                {/* Brand Header */}
                <div className="text-center border-b-2 border-double border-slate-300 pb-4 mb-5">
                    <h1 className="text-sm font-extrabold text-slate-900 uppercase leading-tight">{settings.office_name || 'SPPG SUKAJADI MANDIRI'}</h1>
                    <p className="text-[9px] text-teal-700 font-extrabold uppercase tracking-wider mt-0.5">Makan Bergizi Gratis (MBG) Indonesia</p>
                    <span className="inline-block text-[10px] font-bold text-slate-700 bg-slate-100 px-3 py-0.5 rounded-full mt-2 uppercase tracking-wide">
                        Slip Gaji Karyawan
                    </span>
                </div>

                {/* Info Block (Grid) */}
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-800 mb-6 pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                        <div>
                            <span className="block text-[8.5px] text-slate-400 font-bold uppercase leading-none">NAMA KARYAWAN</span>
                            <span className="font-bold text-slate-900">{payroll.employee.name}</span>
                        </div>
                        <div>
                            <span className="block text-[8.5px] text-slate-400 font-bold uppercase leading-none">NIP</span>
                            <span className="font-bold text-slate-700 tabular-nums">{payroll.employee.nip}</span>
                        </div>
                        <div>
                            <span className="block text-[8.5px] text-slate-400 font-bold uppercase leading-none">POSISI / JABATAN</span>
                            <span className="font-bold text-slate-700">{payroll.employee.role}</span>
                        </div>
                    </div>
                    <div className="space-y-1 text-right">
                        <div>
                            <span className="block text-[8.5px] text-slate-400 font-bold uppercase leading-none">PERIODE GAJI</span>
                            <span className="font-bold text-slate-900">{monthsList[payroll.month - 1]} {payroll.year}</span>
                        </div>
                        <div>
                            <span className="block text-[8.5px] text-slate-400 font-bold uppercase leading-none">STATUS TRANSFER</span>
                            <span className={`inline-block text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${
                                payroll.status === 'Paid' 
                                    ? 'bg-teal-50 text-teal-700 border border-teal-100' 
                                    : 'bg-slate-50 text-slate-500 border border-slate-200'
                            }`}>
                                {payroll.status === 'Paid' ? 'PAID / LUNAS' : 'DRAFT / BLUM BAYAR'}
                            </span>
                        </div>
                        <div>
                            <span className="block text-[8.5px] text-slate-400 font-bold uppercase leading-none">TANGGAL PEMBAYARAN</span>
                            <span className="font-bold text-slate-700 tabular-nums">{paymentDateStr}</span>
                        </div>
                    </div>
                </div>

                {/* Earnings & Deductions Tables */}
                <div className="space-y-4 mb-6">
                    {/* Earnings Section */}
                    <div>
                        <h3 className="text-[9.5px] font-extrabold text-teal-700 uppercase tracking-wider mb-2 border-b border-teal-50 pb-0.5">A. Penerimaan (Earnings)</h3>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between font-semibold">
                                <span className="text-slate-600">1. Gaji Pokok Bulanan</span>
                                <span className="font-bold text-slate-800 tabular-nums">{formatRupiah(payroll.base_salary)}</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                                <span className="text-slate-600">
                                    2. Tunjangan Harian Kehadiran ({payroll.days_present} Hari * {formatRupiah(payroll.employee.daily_allowance)})
                                </span>
                                <span className="font-bold text-slate-800 tabular-nums">{formatRupiah(payroll.daily_allowances_total)}</span>
                            </div>
                            {payroll.bonuses > 0 && (
                                <div className="flex justify-between font-semibold">
                                    <span className="text-teal-700 font-bold">3. Insentif / Bonus SPPG</span>
                                    <span className="font-bold text-teal-700 tabular-nums">+{formatRupiah(payroll.bonuses)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Deductions Section */}
                    {payroll.deductions > 0 && (
                        <div>
                            <h3 className="text-[9.5px] font-extrabold text-rose-700 uppercase tracking-wider mb-2 border-b border-rose-50 pb-0.5">B. Potongan (Deductions)</h3>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between font-semibold">
                                    <span className="text-rose-700 font-bold">1. Akumulasi Potongan Kehadiran</span>
                                    <span className="font-bold text-rose-700 tabular-nums">-{formatRupiah(payroll.deductions)}</span>
                                </div>
                                <p className="text-[9.5px] text-slate-400 italic">
                                    * Dihitung berdasarkan keterlambatan check-in QR (Rp {settings.late_penalty_per_minute || 1000}/menit) dan mangkir/tidak hadir.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Net Salary Block */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-8 flex justify-between items-center">
                    <div>
                        <span className="block text-[10px] text-slate-500 font-extrabold uppercase">Total Diterima (Net Take Home Pay)</span>
                        <span className="text-[9px] text-slate-400 leading-normal">A. Penerimaan dikurangi B. Potongan</span>
                    </div>
                    <span className="text-base font-extrabold text-slate-950 tabular-nums bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                        {formatRupiah(payroll.net_salary)}
                    </span>
                </div>

                {/* Signatures Footer */}
                <div className="grid grid-cols-2 gap-4 text-center text-xs font-bold text-slate-700 pt-6 border-t border-slate-200">
                    <div className="flex flex-col justify-between h-20">
                        <span>Penerima Gaji,</span>
                        <span className="underline uppercase">{payroll.employee.name}</span>
                    </div>
                    <div className="flex flex-col justify-between h-20">
                        <span>Kepala Satuan Pelayanan,</span>
                        <span className="underline uppercase">
                            {kepalaSatuan ? kepalaSatuan.name : 'BUDI SANTOSO, S.Sos'}
                        </span>
                    </div>
                </div>

                {/* Small program tag */}
                <div className="text-center mt-10">
                    <span className="text-[6.5px] text-slate-400 tracking-wider uppercase">Sistem Keuangan Otomatis SPPG-MBG 2026</span>
                </div>
            </div>
        </div>
    );
}
