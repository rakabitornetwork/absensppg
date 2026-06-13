import React from 'react';
import { useForm, Head, usePage } from '@inertiajs/react';
import { Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';

export default function Login() {
    const { props } = usePage();
    const { appLogo } = props;
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="min-h-screen bg-[#b5e0ea] flex items-center justify-center p-4 antialiased font-sans relative overflow-hidden">
            <Head title="Masuk" />

            <div className="w-full max-w-[380px] bg-white/90 backdrop-blur-md border border-white/80 rounded-2xl shadow-2xl shadow-blue-900/12 p-6 z-10">
                {/* Brand Logo */}
                <div className="flex flex-col items-center text-center mb-6">
                    {appLogo ? (
                        <div className="w-14 h-14 rounded-2xl bg-white border border-blue-100 flex items-center justify-center shadow-lg shadow-blue-900/10 mb-3 overflow-hidden">
                            <img src={appLogo} className="w-full h-full object-contain p-1.5" alt="Logo" />
                        </div>
                    ) : (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 mb-3 animate-pulse">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                    )}
                    <h1 className="text-base font-bold text-blue-950 leading-tight">SPPG Absensi & Payroll</h1>
                    <p className="text-[11px] text-blue-700/75 font-medium mt-1">
                        Program Makan Bergizi Gratis (MBG) Indonesia
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1" htmlFor="email">
                            Email Administrator
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <Mail className="w-3.5 h-3.5" />
                            </span>
                            <input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className={`w-full text-xs pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-1 transition-all duration-150 ${
                                    errors.email 
                                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' 
                                        : 'border-blue-100 focus:border-blue-600 focus:ring-blue-500/20'
                                }`}
                                placeholder="nama@sppg.com"
                                required
                            />
                        </div>
                        {errors.email && (
                            <p className="text-[10px] text-rose-600 mt-1 font-semibold">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1" htmlFor="password">
                            Kata Sandi
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <Lock className="w-3.5 h-3.5" />
                            </span>
                            <input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className={`w-full text-xs pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-1 transition-all duration-150 ${
                                    errors.password 
                                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' 
                                        : 'border-blue-100 focus:border-blue-600 focus:ring-blue-500/20'
                                }`}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        {errors.password && (
                            <p className="text-[10px] text-rose-600 mt-1 font-semibold">{errors.password}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="w-3.5 h-3.5 rounded border-blue-200 text-blue-700 focus:ring-blue-500/20"
                            />
                            <span className="text-[10px] text-slate-500 font-bold">Ingat saya</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-gradient-to-r from-blue-800 via-blue-700 to-sky-600 hover:from-blue-900 hover:via-blue-800 hover:to-sky-700 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg shadow-blue-700/20 active:translate-y-[1px] transition-all duration-150 flex items-center justify-center gap-2"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Memproses...
                            </>
                        ) : (
                            'Masuk Aplikasi'
                        )}
                    </button>
                </form>

                {/* Info Credentials for Demo */}
                <div className="mt-5 p-3 rounded-lg bg-blue-50/80 border border-blue-100 text-[10px] text-blue-950">
                    <p className="font-bold mb-1">Informasi Akun Demo:</p>
                    <p>Email: <span className="font-semibold select-all">admin@sppg.com</span></p>
                    <p>Sandi: <span className="font-semibold select-all">12345678</span></p>
                </div>
            </div>
        </div>
    );
}
